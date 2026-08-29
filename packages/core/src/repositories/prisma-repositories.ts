import { IPostRepository, IProjectLeadRepository, IProjectRepository, IIngestionRunRepository } from './interfaces';
import { SourcePost } from '../types';
import { prisma } from '@repo/database';

export class PrismaPostRepository implements IPostRepository {
  async existsByExternalId(externalId: string): Promise<boolean> {
    const post = await prisma.redditPost.findUnique({
      where: { externalId },
      select: { id: true }
    });
    return !!post;
  }

  async upsertPost(post: SourcePost, contentHash: string): Promise<string> {
    const upserted = await prisma.redditPost.upsert({
      where: { externalId: post.externalId },
      update: {}, // We don't overwrite if it already exists, to avoid destroying data
      create: {
        externalId: post.externalId,
        sourceUrl: post.sourceUrl,
        title: post.title,
        body: post.body,
        authorIdentifier: post.authorIdentifier,
        subreddit: post.subreddit,
        publishedAt: post.publishedAt,
        contentHash: contentHash,
      }
    });
    return upserted.id;
  }
}

export class PrismaProjectLeadRepository implements IProjectLeadRepository {
  async exists(projectId: string, redditPostId: string): Promise<boolean> {
    const lead = await prisma.projectLead.findUnique({
      where: {
        projectId_redditPostId: { projectId, redditPostId }
      },
      select: { id: true }
    });
    return !!lead;
  }

  async createLead(projectId: string, redditPostId: string, provenance?: string, wouldHaveMatchedOldExactFilter?: boolean): Promise<string> {
    const lead = await prisma.projectLead.create({
      data: {
        projectId,
        redditPostId,
        status: 'NEW',
        provenance,
        wouldHaveMatchedOldExactFilter
      }
    });
    return lead.id;
  }
}

export class PrismaProjectRepository implements IProjectRepository {
  async getActiveProjects(): Promise<Array<{
    id: string;
    name: string;
    productDescription: string;
    idealCustomerProfile?: string | null;
    exclusionRules?: string | null;
    vocabularyInputHash?: string | null;
    vocabulary?: any;
    keywords: string[];
    competitors: string[];
    sources: string[];
  }>> {
    const projects = await prisma.project.findMany({
      include: {
        keywords: true,
        sources: { where: { enabled: true } }
      }
    });

    return projects.map(p => ({
      id: p.id,
      name: p.name,
      productDescription: p.productDescription,
      idealCustomerProfile: p.idealCustomerProfile,
      exclusionRules: p.exclusionRules,
      vocabularyInputHash: p.vocabularyInputHash,
      vocabulary: p.vocabulary,
      keywords: p.keywords.filter(k => k.type !== 'COMPETITOR').map(k => k.keyword),
      competitors: p.keywords.filter(k => k.type === 'COMPETITOR').map(k => k.keyword),
      sources: p.sources.map(s => s.sourceIdentifier)
    }));
  }

  async updateVocabulary(projectId: string, hash: string, vocabulary: any, provider?: string, model?: string): Promise<void> {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        vocabularyInputHash: hash,
        vocabularyGeneratedAt: new Date(),
        vocabularyProvider: provider ?? null,
        vocabularyModel: model ?? null,
        vocabulary: vocabulary
      }
    });
  }
}

export class PrismaIngestionRunRepository implements IIngestionRunRepository {
  async startRun(projectId: string | null): Promise<string> {
    const run = await prisma.ingestionRun.create({
      data: {
        projectId,
        status: 'RUNNING'
      }
    });
    return run.id;
  }

  async updateMetrics(runId: string, metrics: { 
    postsDiscovered: number; 
    postsInvalid: number; 
    postsPreFiltered: number; 
    postsDuplicateLeads: number; 
    postsClassified: number;
    leadsCreated: number;
    highIntentLeads: number;
  }): Promise<void> {
    await prisma.ingestionRun.update({
      where: { id: runId },
      data: {
        postsDiscovered: metrics.postsDiscovered,
        postsInvalid: metrics.postsInvalid,
        postsPreFiltered: metrics.postsPreFiltered,
        postsDuplicateLeads: metrics.postsDuplicateLeads,
        postsClassified: metrics.postsClassified,
        leadsCreated: metrics.leadsCreated,
        highIntentLeads: metrics.highIntentLeads
      }
    });
  }

  async completeRun(runId: string): Promise<void> {
    await prisma.ingestionRun.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
  }

  async failRun(runId: string, error: string): Promise<void> {
    await prisma.ingestionRun.update({
      where: { id: runId },
      data: {
        status: 'FAILED',
        errorDetails: error,
        completedAt: new Date()
      }
    });
  }
}

export class PrismaAnalysisRepository {
  async createAnalysis(projectLeadId: string, analysis: any): Promise<string> {
    const created = await prisma.analysis.create({
      data: {
        projectLeadId: projectLeadId,
        model: analysis.model || 'mock-llm',
        modelVersion: analysis.modelVersion || '1.0',
        relevanceScore: analysis.relevanceScore,
        intentScore: analysis.intentScore,
        finalScore: analysis.finalScore,
        intentType: analysis.intentType,
        buyingStage: analysis.buyingStage,
        summary: analysis.summary,
        problemSummary: analysis.problemSummary,
        matchedKeywords: analysis.matchedKeywords,
        matchedCompetitors: analysis.matchedCompetitors,
        whyItMatters: analysis.whyItMatters || 'Unknown',
        recommendedPriority: analysis.recommendedPriority,
      }
    });
    return created.id;
  }
}

