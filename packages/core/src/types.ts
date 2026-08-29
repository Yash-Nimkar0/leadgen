export interface SourcePost {
  externalId: string;
  sourceUrl: string;
  title: string;
  body: string | null;
  authorIdentifier: string;
  subreddit: string;
  publishedAt: Date;
  provenance?: string;
  expected?: {
    intentType: IntentType;
    minIntentScore: number;
    maxIntentScore: number;
    relevanceLevel: "HIGH" | "MEDIUM" | "LOW";
  };
}

export interface FetchCandidatesInput {
  projectConfig: {
    id: string;
    keywords: string[];
    sources: string[];
    vocabulary?: any;
  };
}

export interface SourceFetchInput {
  query?: string;
  source?: string;
  limit: number;
  cursor?: string;
}

export interface SourceProvider {
  fetchCandidates(input: FetchCandidatesInput): Promise<SourcePost[]>;
}

export type IntentType =
  | 'ACTIVE_PURCHASE'
  | 'ALTERNATIVE_SEEKING'
  | 'RECOMMENDATION_REQUEST'
  | 'PROBLEM_AWARE'
  | 'SOLUTION_RESEARCH'
  | 'COMPETITOR_DISSATISFACTION'
  | 'COMPARISON'
  | 'PASSIVE_DISCUSSION'
  | 'LOW_VALUE'
  | 'IRRELEVANT';

export interface AnalysisResult {
  relevanceScore: number;
  intentScore: number;
  intentType: IntentType;
  problemSummary: string | null;
  matchedKeywords: string[];
  matchedCompetitors: string[];
  reasoningSummary: string;
  recommendedAction: string;
}
