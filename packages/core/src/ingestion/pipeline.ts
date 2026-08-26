import { SourceProvider, SourcePost } from '../types';
import { IPostRepository, IProjectLeadRepository, IProjectRepository, IIngestionRunRepository, IAnalysisRepository } from '../repositories/interfaces';
import { Deduplicator } from './deduplicator';
import { ProjectMatcher } from './project-matcher';
import { normalizePost } from './normalizer';
import { ILLMProvider } from '../providers/llm/interfaces';
import { Scorer } from './scorer';
import { NotificationService } from '../notification/NotificationService';

export class IngestionPipeline {
  constructor(
    private provider: SourceProvider,
    private postRepo: IPostRepository,
    private leadRepo: IProjectLeadRepository,
    private projectRepo: IProjectRepository,
    private runRepo: IIngestionRunRepository,
    private llmProvider: ILLMProvider,
    private analysisRepo: IAnalysisRepository,
    private notificationService?: NotificationService
  ) {}

  async run(projectId?: string) {
    const runId = await this.runRepo.startRun(projectId || null);
    
    const metrics = { postsDiscovered: 0, postsFiltered: 0, postsClassified: 0 };
    const deduplicator = new Deduplicator(this.postRepo);
    const matcher = new ProjectMatcher();
    const scorer = new Scorer();
    
    try {
      const projects = await this.projectRepo.getActiveProjects();
      const targetProjects = projectId ? projects.filter(p => p.id === projectId) : projects;

      for (const project of targetProjects) {
        // Fetch candidates for this specific project
        const posts = await this.provider.fetchCandidates({ projectConfig: project });
        metrics.postsDiscovered += posts.length;

        for (const rawPost of posts) {
          const normalized = normalizePost(rawPost);
          if (!normalized) {
             metrics.postsFiltered++;
             continue; // Invalid post
          }

          // Check if it's a candidate for this project
          const isMatch = matcher.isCandidate(normalized, project);
          if (!isMatch) {
            metrics.postsFiltered++;
            continue;
          }

          // Hash and upsert the global RedditPost
          const contentHash = deduplicator.generateContentHash(normalized);
          const internalPostId = await this.postRepo.upsertPost(normalized, contentHash);

          // Deduplicate lead for this project
          const leadExists = await this.leadRepo.exists(project.id, internalPostId);
          if (!leadExists) {
            const projectLeadId = await this.leadRepo.createLead(project.id, internalPostId);
            
            // LLM Classification Stage
            try {
              const classification = await this.llmProvider.classify({
                projectConfig: {
                  name: project.name,
                  description: project.productDescription,
                  keywords: project.keywords,
                  competitors: project.competitors
                },
                post: {
                  title: normalized.title,
                  body: normalized.body,
                  subreddit: normalized.subreddit
                }
              });
              
              metrics.postsClassified++;
              
              const finalScore = scorer.calculateFinalScore(classification);
              
              await this.analysisRepo.createAnalysis(projectLeadId, {
                relevanceScore: classification.relevance,
                intentScore: classification.commercialIntent,
                finalScore,
                intentType: classification.intentType,
                buyingStage: classification.buyingStage,
                summary: classification.summary,
                problemSummary: classification.problemSummary,
                matchedKeywords: classification.matchedKeywords,
                matchedCompetitors: classification.matchedCompetitors,
                whyItMatters: classification.whyItMatters,
                model: (classification as any)._routerMetadata?.provider,
                modelVersion: (classification as any)._routerMetadata?.model,
                recommendedPriority: classification.recommendedPriority
              });
              
              if (this.notificationService) {
                // Process notification asynchronously so it doesn't block ingestion
                // In a production serverless environment, this would be await or waitUntil
                this.notificationService.processLead(projectLeadId).catch((err) => {
                  console.error(`Failed to process notification for lead ${projectLeadId}`, err);
                });
              }
            } catch (llmError) {
              console.error(`Failed to classify post ${normalized.externalId}`, llmError);
              // We created the lead, but classification failed. Can be retried later.
            }
          } else {
             // Lead already exists, filter it out from new discoveries
             metrics.postsFiltered++;
          }
        }
      }

      await this.runRepo.updateMetrics(runId, metrics);
      await this.runRepo.completeRun(runId);
    } catch (error: any) {
      await this.runRepo.failRun(runId, error.message || 'Unknown error');
      throw error;
    }
  }
}

