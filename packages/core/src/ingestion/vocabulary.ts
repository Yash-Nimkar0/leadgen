import { createHash } from 'crypto';

export interface ProjectVocabulary {
  entities: string[];
  synonyms: string[];
  subtypes: string[];
  contexts: string[];
  problemTerms: string[];
  intentTerms: string[];
  competitorTerms: string[];
  exclusionTerms: string[];
}

export function computeVocabularyHash(project: {
  productDescription?: string;
  keywords: string[];
  competitors: string[];
  idealCustomerProfile?: string;
  exclusionRules?: string;
}): string {
  // Normalize arrays by trimming, lowercasing, and sorting to ensure order independence
  const normalizeArray = (arr: string[]) => 
    [...arr].map(item => item.trim().toLowerCase()).sort();

  const normalized = {
    desc: (project.productDescription || '').trim().toLowerCase(),
    keywords: normalizeArray(project.keywords),
    competitors: normalizeArray(project.competitors),
    icp: (project.idealCustomerProfile || '').trim().toLowerCase(),
    exclusions: (project.exclusionRules || '').trim().toLowerCase(),
  };

  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

export function enforceVocabularyLimits(vocab: any): ProjectVocabulary {
  const limit = 20;
  
  const enforce = (arr: any) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .slice(0, limit)
      .map(item => item.trim());
  };

  return {
    entities: enforce(vocab.entities),
    synonyms: enforce(vocab.synonyms),
    subtypes: enforce(vocab.subtypes),
    contexts: enforce(vocab.contexts),
    problemTerms: enforce(vocab.problemTerms),
    intentTerms: enforce(vocab.intentTerms),
    competitorTerms: enforce(vocab.competitorTerms),
    exclusionTerms: enforce(vocab.exclusionTerms),
  };
}
