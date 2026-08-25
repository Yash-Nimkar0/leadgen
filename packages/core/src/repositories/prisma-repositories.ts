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

  async createLead(projectId: string, redditPostId: string): Promise<string> {
    const lead = await prisma.projectLead.create({
      data: {
        projectId,
        redditPostId,
        status: 'NEW'
      }
    });
    return lead.id;
  }
}

export class PrismaProjectRepository implements IProjectRepository {
  async getActiveProjects(): Promise<Array<{ id: string; keywords: string[]; sources: string[] }>> {
    const projects = await prisma.project.findMany({
      include: {
        keywords: true,
        sources: { where: { enabled: true } }
      }
    });
    
    return projects.map(p => ({
      id: p.id,
      keywords: p.keywords.map(k => k.keyword),
      sources: p.sources.map(s => s.sourceIdentifier)
    }));
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

  async updateMetrics(runId: string, metrics: { postsDiscovered: number; postsFiltered: number; postsClassified: number; }): Promise<void> {
    await prisma.ingestionRun.update({
      where: { id: runId },
      data: {
        postsDiscovered: metrics.postsDiscovered,
        postsFiltered: metrics.postsFiltered,
        postsClassified: metrics.postsClassified
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

