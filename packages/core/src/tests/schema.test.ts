import { describe, it, expect } from 'vitest';
import { ClassificationResultSchema } from '../providers/llm/interfaces';

describe('ClassificationResultSchema', () => {
  it('validates a correct payload', () => {
    const validPayload = {
      relevance: 80,
      commercialIntent: 90,
      intentType: 'ACTIVE_PURCHASE',
      problemSummary: 'Need cheaper support tool',
      matchedKeywords: ['support'],
      matchedCompetitors: ['intercom'],
      buyingStage: 'Solution Aware',
      summary: 'Wants alternative.',
      whyItMatters: 'High intent.',
      recommendedPriority: 'HIGH'
    };

    const result = ClassificationResultSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('fails on missing required fields', () => {
    const invalidPayload = {
      relevance: 80
      // missing everything else
    };
    const result = ClassificationResultSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('fails on invalid enum for intentType', () => {
    const payload = {
      relevance: 80,
      commercialIntent: 90,
      intentType: 'NOT_A_REAL_INTENT', // invalid
      problemSummary: null,
      matchedKeywords: [],
      matchedCompetitors: [],
      buyingStage: 'Solution Aware',
      summary: 'Wants alternative.',
      whyItMatters: 'High intent.',
      recommendedPriority: 'HIGH'
    };
    const result = ClassificationResultSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('enforces score boundaries 0-100', () => {
    const payload = {
      relevance: 150, // invalid
      commercialIntent: 90,
      intentType: 'PASSIVE_DISCUSSION',
      problemSummary: null,
      matchedKeywords: [],
      matchedCompetitors: [],
      buyingStage: 'Unaware',
      summary: 'sum',
      whyItMatters: 'matters',
      recommendedPriority: 'LOW'
    };
    const result = ClassificationResultSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
