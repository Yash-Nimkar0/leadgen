import { describe, it, expect } from 'vitest';
import { Scorer } from '../ingestion/scorer';
import { ClassificationResult } from '../providers/llm/interfaces';

describe('Scorer', () => {
  const scorer = new Scorer();

  const baseResult: ClassificationResult = {
    relevance: 50,
    commercialIntent: 50,
    intentType: 'PASSIVE_DISCUSSION',
    problemSummary: null,
    matchedKeywords: [],
    matchedCompetitors: [],
    buyingStage: 'Problem Aware',
    summary: '',
    whyItMatters: '',
    recommendedPriority: 'LOW'
  };

  it('calculates expected baseline score', () => {
    // 50 * 0.4 + 50 * 0.4 + PASSIVE_DISCUSSION tier (0) = 20 + 20 = 40
    expect(scorer.calculateFinalScore(baseResult)).toBe(40);
  });

  it('adds competitor bonus correctly', () => {
    const result = { ...baseResult, matchedCompetitors: ['zendesk'] };
    // 40 + 8 = 48
    expect(scorer.calculateFinalScore(result)).toBe(48);
  });

  it('adds problem summary bonus correctly', () => {
    const result = { ...baseResult, problemSummary: 'Need help' };
    // 40 + 6 = 46
    expect(scorer.calculateFinalScore(result)).toBe(46);
  });

  it('combines all bonuses correctly', () => {
    const result = { ...baseResult, matchedCompetitors: ['zendesk'], problemSummary: 'Need help' };
    // 40 + 8 + 6 = 54
    expect(scorer.calculateFinalScore(result)).toBe(54);
  });

  it('caps max score at 100', () => {
    const maxResult: ClassificationResult = {
      ...baseResult,
      intentType: 'ACTIVE_PURCHASE',
      relevance: 100,
      commercialIntent: 100,
      matchedCompetitors: ['zendesk'],
      problemSummary: 'Help'
    };
    // 100*0.4 + 100*0.4 + ACTIVE_PURCHASE tier (15) + 8 + 6 = 109, capped at 100
    expect(scorer.calculateFinalScore(maxResult)).toBe(100);
  });

  it('caps min score at 0', () => {
    const minResult: ClassificationResult = {
      ...baseResult,
      relevance: 0,
      commercialIntent: 0,
      matchedCompetitors: [],
      problemSummary: null
    };
    expect(scorer.calculateFinalScore(minResult)).toBe(0);
  });

  describe('intent-type score bands', () => {
    it('very strong purchase: ACTIVE_PURCHASE + HIGH relevance + explicit buying signals -> very high score', () => {
      const result: ClassificationResult = {
        ...baseResult,
        intentType: 'ACTIVE_PURCHASE',
        relevance: 95,
        commercialIntent: 95,
        matchedCompetitors: ['Intercom'],
        problemSummary: 'Ready to buy today, budget approved.'
      };
      const score = scorer.calculateFinalScore(result);
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('alternative seeking: HIGH relevance + named competitor -> high score', () => {
      const result: ClassificationResult = {
        ...baseResult,
        intentType: 'ALTERNATIVE_SEEKING',
        relevance: 90,
        commercialIntent: 60,
        matchedCompetitors: ['Zendesk'],
        problemSummary: 'Looking for a replacement for Zendesk.'
      };
      const score = scorer.calculateFinalScore(result);
      expect(score).toBeGreaterThanOrEqual(75);
    });

    it('problem aware: MEDIUM relevance + no explicit buying signal -> medium/low score, well below active purchase', () => {
      const result: ClassificationResult = {
        ...baseResult,
        intentType: 'PROBLEM_AWARE',
        relevance: 60,
        commercialIntent: 30,
        matchedCompetitors: [],
        problemSummary: 'Ticket volume is out of hand.'
      };
      const score = scorer.calculateFinalScore(result);
      expect(score).toBeGreaterThan(20);
      expect(score).toBeLessThan(60);
    });

    it('passive discussion: LOW relevance -> low score', () => {
      const result: ClassificationResult = {
        ...baseResult,
        intentType: 'PASSIVE_DISCUSSION',
        relevance: 15,
        commercialIntent: 10,
        matchedCompetitors: [],
        problemSummary: null
      };
      const score = scorer.calculateFinalScore(result);
      expect(score).toBeLessThan(20);
    });

    it('irrelevant -> very low score regardless of other fields', () => {
      const result: ClassificationResult = {
        ...baseResult,
        intentType: 'IRRELEVANT',
        relevance: 5,
        commercialIntent: 0,
        matchedCompetitors: [],
        problemSummary: null
      };
      const score = scorer.calculateFinalScore(result);
      expect(score).toBeLessThan(10);
    });

    it('ranks a strong purchase signal above a passive discussion of the same raw relevance/intent numbers', () => {
      const active: ClassificationResult = {
        ...baseResult,
        intentType: 'ACTIVE_PURCHASE',
        relevance: 60,
        commercialIntent: 60,
      };
      const passive: ClassificationResult = {
        ...baseResult,
        intentType: 'PASSIVE_DISCUSSION',
        relevance: 60,
        commercialIntent: 60,
      };
      expect(scorer.calculateFinalScore(active)).toBeGreaterThan(scorer.calculateFinalScore(passive));
    });
  });

  describe('edge cases', () => {
    it('clamps a score that would otherwise fall below 0', () => {
      const result: ClassificationResult = {
        ...baseResult,
        intentType: 'IRRELEVANT',
        relevance: -50,
        commercialIntent: -50,
      };
      expect(scorer.calculateFinalScore(result)).toBe(0);
    });

    it('clamps a score that would otherwise exceed 100', () => {
      const result: ClassificationResult = {
        ...baseResult,
        intentType: 'ACTIVE_PURCHASE',
        relevance: 200,
        commercialIntent: 200,
        matchedCompetitors: ['A', 'B'],
        problemSummary: 'x'
      };
      expect(scorer.calculateFinalScore(result)).toBe(100);
    });

    it('handles a missing (null) problem summary without the bonus', () => {
      const withSummary = { ...baseResult, problemSummary: 'A real problem' };
      const withoutSummary = { ...baseResult, problemSummary: null };
      expect(scorer.calculateFinalScore(withSummary)).toBeGreaterThan(scorer.calculateFinalScore(withoutSummary));
    });

    it('treats a whitespace-only problem summary as missing', () => {
      const result = { ...baseResult, problemSummary: '   ' };
      expect(scorer.calculateFinalScore(result)).toBe(scorer.calculateFinalScore({ ...baseResult, problemSummary: null }));
    });

    it('handles zero competitors (no bonus)', () => {
      const result = { ...baseResult, matchedCompetitors: [] };
      expect(scorer.calculateFinalScore(result)).toBe(40);
    });

    it('applies the same flat competitor bonus for multiple competitors as for one', () => {
      const one = { ...baseResult, matchedCompetitors: ['A'] };
      const many = { ...baseResult, matchedCompetitors: ['A', 'B', 'C'] };
      expect(scorer.calculateFinalScore(one)).toBe(scorer.calculateFinalScore(many));
    });

    it('rounds to the nearest integer', () => {
      const result: ClassificationResult = { ...baseResult, relevance: 33, commercialIntent: 33 };
      // 33*0.4 + 33*0.4 = 13.2 + 13.2 = 26.4 -> 26
      expect(scorer.calculateFinalScore(result)).toBe(26);
    });

    it('falls back to no tier bonus for an unrecognized intentType value (defensive against malformed data)', () => {
      const result = { ...baseResult, intentType: 'NOT_A_REAL_TYPE' as ClassificationResult['intentType'] };
      expect(scorer.calculateFinalScore(result)).toBe(40);
    });
  });
});
