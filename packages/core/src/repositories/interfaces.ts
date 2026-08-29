import { SourcePost } from '../types';

export interface IPostRepository {
  /**
   * Returns true if a post with the given externalId already exists.
   */
  existsByExternalId(externalId: string): Promise<boolean>;
  
  /**
   * Persists the normalized RedditPost and returns its internal ID.
   * If it already exists, it should safely return the existing internal ID.
   */
  upsertPost(post: SourcePost, contentHash: string): Promise<string>;
}

export interface IProjectLeadRepository {
  /**
   * Checks if a lead already exists for a specific project and post.
   */
  exists(projectId: string, redditPostId: string): Promise<boolean>;

  /**
   * Creates the ProjectLead linking the project and the post.
   */
  createLead(projectId: string, redditPostId: string, provenance?: string, wouldHaveMatchedOldExactFilter?: boolean): Promise<string>;
}

export interface IProjectRepository {
  /**
   * Returns all active projects with their real name/description/keywords/sources/
   * competitors - the same data used to classify a lead must reflect the project
   * that lead was actually matched against.
   */
  getActiveProjects(): Promise<Array<{
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
  }>>;

  updateVocabulary(projectId: string, hash: string, vocabulary: any, provider?: string, model?: string): Promise<void>;
}

export interface IIngestionRunRepository {
  startRun(projectId: string | null): Promise<string>;
  updateMetrics(runId: string, metrics: { 
    postsDiscovered: number, 
    postsInvalid: number, 
    postsPreFiltered: number, 
    postsDuplicateLeads: number, 
    postsClassified: number,
    leadsCreated: number,
    highIntentLeads: number
  }): Promise<void>;
  completeRun(runId: string): Promise<void>;
  failRun(runId: string, error: string): Promise<void>;
}

export interface IAnalysisRepository {
  /**
   * Persists the classification result and final score into the Analysis model for a given ProjectLead.
   */
  createAnalysis(projectLeadId: string, analysis: any): Promise<string>;
}

