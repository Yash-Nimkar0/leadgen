import { z } from 'zod';
import { IntentType } from '../../types';

export const ClassificationResultSchema = z.object({
  relevance: z.number().min(0).max(100).describe('Score from 0-100 indicating how relevant the post is to the project.'),
  commercialIntent: z.number().min(0).max(100).describe('Score from 0-100 indicating the level of commercial buying intent.'),
  intentType: z.enum([
    'ACTIVE_PURCHASE',
    'ALTERNATIVE_SEEKING',
    'RECOMMENDATION_REQUEST',
    'PROBLEM_AWARE',
    'SOLUTION_RESEARCH',
    'COMPETITOR_DISSATISFACTION',
    'COMPARISON',
    'PASSIVE_DISCUSSION',
    'LOW_VALUE',
    'IRRELEVANT'
  ]).describe('The primary intent category.'),
  problemSummary: z.string().nullable().describe('A short summary of the specific problem the user is facing, or null if none.'),
  matchedKeywords: z.array(z.string()).describe('Exact keywords from the project configuration that were found in the text.'),
  matchedCompetitors: z.array(z.string()).describe('Competitors mentioned in the text that match the project configuration.'),
  buyingStage: z.string().describe('The estimated stage of the buying journey (e.g., Unaware, Problem Aware, Solution Aware, Product Aware, Most Aware).'),
  summary: z.string().describe('A 1-2 sentence summary of the post context.'),
  whyItMatters: z.string().describe('Why this post matters for the specific product.'),
  recommendedPriority: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('Recommended priority for outreach.')
});

export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

export interface ClassificationInput {
  projectConfig: {
    name: string;
    description: string;
    idealCustomerProfile?: string | null;
    exclusionRules?: string | null;
    keywords: string[];
    competitors: string[]; // specifically filtered competitor keywords
  };
  post: {
    title: string;
    body: string | null;
    subreddit: string;
  };
}

export interface ILLMProvider {
  classify(input: ClassificationInput): Promise<ClassificationResult>;
  generateVocabulary?(projectConfig: any): Promise<any>;
}

export type LLMErrorCategory =
  | "RATE_LIMITED"
  | "QUOTA_EXHAUSTED"
  | "TIMEOUT"
  | "TEMPORARY_PROVIDER_ERROR"
  | "AUTHENTICATION_ERROR"
  | "INVALID_REQUEST"
  | "INVALID_RESPONSE"
  | "UNKNOWN";

export class LLMError extends Error {
  constructor(
    public category: LLMErrorCategory,
    message: string,
    public provider: string,
    public model?: string
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export const ProjectVocabularySchema = z.object({
  entities: z.array(z.string()).max(20),
  synonyms: z.array(z.string()).max(20),
  subtypes: z.array(z.string()).max(20),
  contexts: z.array(z.string()).max(20),
  problemTerms: z.array(z.string()).max(20),
  intentTerms: z.array(z.string()).max(20),
  competitorTerms: z.array(z.string()).max(20),
  exclusionTerms: z.array(z.string()).max(20)
});
