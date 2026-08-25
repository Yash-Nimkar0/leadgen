import { ILLMProvider, ClassificationInput, ClassificationResult } from './interfaces';

export class MockLLMProvider implements ILLMProvider {
  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const externalId = input.post.title.toLowerCase();

    if (externalId.includes('cheaper') || externalId.includes('intercom')) {
      return {
        relevance: 95,
        commercialIntent: 90,
        intentType: 'ACTIVE_PURCHASE',
        problemSummary: 'Seeking cheaper alternative to Intercom',
        matchedKeywords: ['intercom'],
        matchedCompetitors: ['intercom'],
        buyingStage: 'Product Aware',
        summary: 'User is ready to buy a cheaper AI support tool today.',
        whyItMatters: 'High intent prospect actively evaluating purchases.',
        recommendedPriority: 'HIGH'
      };
    }

    if (externalId.includes('instead of zendesk')) {
      return {
        relevance: 85,
        commercialIntent: 80,
        intentType: 'ALTERNATIVE_SEEKING',
        problemSummary: 'Zendesk is bloated, needs modern alternative',
        matchedKeywords: ['zendesk'],
        matchedCompetitors: ['zendesk'],
        buyingStage: 'Solution Aware',
        summary: 'Small team looking to migrate off Zendesk.',
        whyItMatters: 'Actively searching for alternatives.',
        recommendedPriority: 'HIGH'
      };
    }

    if (externalId.includes('ignore previous instructions')) {
      return {
        relevance: 0,
        commercialIntent: 0,
        intentType: 'IRRELEVANT',
        problemSummary: 'Prompt injection attempt',
        matchedKeywords: [],
        matchedCompetitors: [],
        buyingStage: 'Unaware',
        summary: 'User attempted prompt injection.',
        whyItMatters: 'Malicious or irrelevant data.',
        recommendedPriority: 'LOW'
      };
    }

    return {
      relevance: 50,
      commercialIntent: 40,
      intentType: 'PASSIVE_DISCUSSION',
      problemSummary: null,
      matchedKeywords: [],
      matchedCompetitors: [],
      buyingStage: 'Problem Aware',
      summary: 'General discussion without immediate intent.',
      whyItMatters: 'Could be nurtured for future.',
      recommendedPriority: 'LOW'
    };
  }
}

