import { describe, it, expect, beforeEach } from 'vitest';
import { IngestionPipeline } from '../pipeline';
import { SourcePost, IntentType, AnalysisResult } from '../../types';
import { MockRedditProvider } from '../../providers/reddit/mock-reddit-provider';

// Mock repositories in-memory
class MockProjectRepository {
  async getActiveProjects() {
    return [
      {
        id: 'proj_A',
        name: 'Project A',
        productDescription: 'Project A desc',
        keywords: ['keyword A'],
        competitors: ['comp A'],
        sources: ['source A']
      },
      {
        id: 'proj_B',
        name: 'Project B',
        productDescription: 'Project B desc',
        keywords: ['keyword B'],
        competitors: ['comp B'],
        sources: ['source B']
      }
    ];
  }
  async updateVocabulary(projectId: string, hash: string, vocabulary: any, provider?: string, model?: string): Promise<void> {}
}

class MockPostRepository {
  private posts = new Map<string, SourcePost>();
  
  async existsByExternalId(id: string) {
    return Array.from(this.posts.values()).some(p => p.externalId === id);
  }
  
  async upsertPost(post: SourcePost, hash: string) {
    const internalId = `internal_${post.externalId}`;
    this.posts.set(internalId, post);
    return internalId;
  }
  
  getPostCount() { return this.posts.size; }
}

class MockLeadRepository {
  private leads = new Set<string>();
  
  async exists(projectId: string, postId: string) {
    return this.leads.has(`${projectId}_${postId}`);
  }
  
  async createLead(projectId: string, postId: string) {
    const id = `${projectId}_${postId}`;
    this.leads.add(id);
    return id;
  }
  
  getLeadCount() { return this.leads.size; }
  getLeadsForProject(projectId: string) {
    return Array.from(this.leads).filter(l => l.startsWith(projectId));
  }
}

class MockAnalysisRepository {
  private analyses = new Map<string, any>();
  
  async createAnalysis(leadId: string, analysis: any) {
    this.analyses.set(leadId, analysis);
    return leadId;
  }
  
  getAnalysisCount() { return this.analyses.size; }
}

class MockRunRepository {
  async startRun() { return 'run_1'; }
  async updateMetrics() {}
  async completeRun() {}
  async failRun() {}
}

class MockLLM {
  async classify(input: any) {
    return {
      commercialIntent: 80,
      relevance: 90,
      intentType: 'ACTIVE_PURCHASE' as IntentType,
      buyingStage: 'EVALUATION',
      summary: 'Test',
      problemSummary: 'Test',
      matchedKeywords: [],
      matchedCompetitors: [],
      whyItMatters: 'Test',
      recommendedPriority: 'HIGH'
    };
  }
}

class MockNotification {
  notifiedLeads = new Set<string>();
  async processLead(leadId: string) {
    this.notifiedLeads.add(leadId);
  }
}

class CustomMockProvider {
  async fetchCandidates(input: any): Promise<SourcePost[]> {
    return [
      {
        externalId: 'ext_1',
        title: 'keyword A post',
        body: 'Some content',
        subreddit: 'source A',
        sourceUrl: 'http://test',
        authorIdentifier: 'auth1',
        publishedAt: new Date()
      }
    ];
  }
}

class MockGroqLLM {
  async classify(input: any) {
    const result = {
      commercialIntent: 80,
      relevance: 90,
      intentType: 'ACTIVE_PURCHASE' as IntentType,
      buyingStage: 'EVALUATION',
      summary: 'Test',
      problemSummary: 'Test',
      matchedKeywords: [],
      matchedCompetitors: [],
      whyItMatters: 'Test',
      recommendedPriority: 'HIGH'
    };
    (result as any)._routerMetadata = {
      provider: 'groq',
      model: 'openai/gpt-oss-20b',
      fallbackDepth: 0,
      latency: 100
    };
    return result;
  }
}

describe('IngestionPipeline Integration', () => {
  it('should process a post end-to-end exactly once per project', async () => {
    const postRepo = new MockPostRepository();
    const leadRepo = new MockLeadRepository();
    const projectRepo = new MockProjectRepository();
    const runRepo = new MockRunRepository();
    const analysisRepo = new MockAnalysisRepository();
    const llm = new MockLLM();
    const notification = new MockNotification();
    
    // Use a custom provider that returns exactly one post matching Project A
    const provider = new CustomMockProvider();
    
    const pipeline = new IngestionPipeline(
      provider as any,
      postRepo as any,
      leadRepo as any,
      projectRepo as any,
      runRepo as any,
      llm as any,
      analysisRepo as any,
      notification as any
    );
    
    // First run
    await pipeline.run();
    
    // Verifications
    expect(postRepo.getPostCount()).toBe(1);
    expect(leadRepo.getLeadCount()).toBe(1); // Only matched Project A
    expect(leadRepo.getLeadsForProject('proj_A').length).toBe(1);
    expect(leadRepo.getLeadsForProject('proj_B').length).toBe(0); // Project Config separation verified
    expect(analysisRepo.getAnalysisCount()).toBe(1);
    expect(notification.notifiedLeads.size).toBe(1);
    
    // Second run (duplicate)
    await pipeline.run();
    
    // Everything should remain 1 (deduplication verified)
    expect(postRepo.getPostCount()).toBe(1);
    expect(leadRepo.getLeadCount()).toBe(1);
    expect(analysisRepo.getAnalysisCount()).toBe(1);
    expect(notification.notifiedLeads.size).toBe(1);
  });

  it('should persist the actual provider and model from LLMRouter into Analysis', async () => {
    const postRepo = new MockPostRepository();
    const leadRepo = new MockLeadRepository();
    const projectRepo = new MockProjectRepository();
    const runRepo = new MockRunRepository();
    const analysisRepo = new MockAnalysisRepository();
    const llm = new MockGroqLLM();
    const notification = new MockNotification();
    const provider = new CustomMockProvider();
    
    const pipeline = new IngestionPipeline(
      provider as any,
      postRepo as any,
      leadRepo as any,
      projectRepo as any,
      runRepo as any,
      llm as any,
      analysisRepo as any,
      notification as any
    );
    
    await pipeline.run();
    
    const leads = leadRepo.getLeadsForProject('proj_A');
    expect(leads.length).toBe(1);
    const leadId = leads[0];
    
    // Access the raw analysis payload passed to createAnalysis
    const analysisMap = (analysisRepo as any).analyses;
    const analysis = analysisMap.get(leadId);
    
    expect(analysis).toBeDefined();
    expect(analysis.model).toBe('groq');
    expect(analysis.modelVersion).toBe('openai/gpt-oss-20b');
  });
});
