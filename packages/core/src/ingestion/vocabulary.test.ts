import { describe, it, expect } from "vitest";

import { computeVocabularyHash, enforceVocabularyLimits } from './vocabulary';

describe('Vocabulary System', () => {
  describe('computeVocabularyHash', () => {
    const baseProject = {
      productDescription: 'Test SaaS',
      keywords: ['saas', 'crm'],
      competitors: ['salesforce'],
      idealCustomerProfile: 'B2B',
      exclusionRules: 'no B2C'
    };

    it('should be deterministic and order-independent for arrays', () => {
      const hash1 = computeVocabularyHash(baseProject);
      const hash2 = computeVocabularyHash({
        ...baseProject,
        keywords: ['crm', 'saas'] // Reordered
      });
      expect(hash1).toBe(hash2);
    });

    it('should change hash when a relevant field changes', () => {
      const hash1 = computeVocabularyHash(baseProject);
      const hash2 = computeVocabularyHash({
        ...baseProject,
        keywords: ['saas', 'crm', 'erp'] // Added one
      });
      expect(hash1).not.toBe(hash2);
    });

    it('should handle undefined optional fields gracefully', () => {
      const hash1 = computeVocabularyHash({
        keywords: [],
        competitors: []
      });
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(10);
    });
  });

  describe('enforceVocabularyLimits', () => {
    it('should truncate arrays to max 20 elements', () => {
      const bigArray = Array.from({ length: 30 }, (_, i) => `item${i}`);
      const vocab = {
        entities: bigArray,
        synonyms: [],
        subtypes: [],
        contexts: [],
        problemTerms: [],
        intentTerms: [],
        competitorTerms: [],
        exclusionTerms: []
      };

      const bounded = enforceVocabularyLimits(vocab);
      expect(bounded.entities.length).toBe(20);
      expect(bounded.entities[0]).toBe('item0');
      expect(bounded.entities[19]).toBe('item19');
    });

    it('should filter out non-strings or empty strings safely', () => {
      const vocab = {
        entities: ['valid', '', '  ', null, 123, 'valid2'],
      };
      
      const bounded = enforceVocabularyLimits(vocab);
      expect(bounded.entities).toEqual(['valid', 'valid2']);
    });

    it('should handle malformed non-array input', () => {
      const vocab = {
        entities: 'not an array'
      };
      
      const bounded = enforceVocabularyLimits(vocab);
      expect(bounded.entities).toEqual([]);
    });
  });
});
