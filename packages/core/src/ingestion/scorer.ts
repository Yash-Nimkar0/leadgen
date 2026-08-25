import { ClassificationResult } from '../providers/llm/interfaces';
import { IntentType } from '../types';

/**
 * How strongly each intent category signals real business opportunity, independent of
 * the LLM's own raw commercialIntent number. The LLM tends to rate commercialIntent
 * conservatively for categories that aren't literally "ready to buy" (e.g.
 * SOLUTION_RESEARCH, COMPETITOR_DISSATISFACTION, RECOMMENDATION_REQUEST) even when those
 * categories represent a real, actionable opportunity for outreach. This tier keeps the
 * final score from collapsing to near-zero just because the model was conservative on
 * that one number - it's a second, independent signal derived from the (already
 * calibrated) intent taxonomy rather than the model's free-floating self-assessment.
 */
const INTENT_TYPE_TIER: Record<IntentType, number> = {
  ACTIVE_PURCHASE: 15,
  ALTERNATIVE_SEEKING: 12,
  COMPARISON: 10,
  COMPETITOR_DISSATISFACTION: 10,
  RECOMMENDATION_REQUEST: 10,
  SOLUTION_RESEARCH: 8,
  PROBLEM_AWARE: 4,
  PASSIVE_DISCUSSION: 0,
  LOW_VALUE: 0,
  IRRELEVANT: 0,
};

export class Scorer {
  /**
   * Deterministic scoring function. The LLM provides signals (relevance, commercialIntent,
   * intentType, matchedCompetitors, problemSummary); this function is solely responsible
   * for turning those signals into the final 0-100 business score used for prioritization
   * and notification thresholds. The model's raw commercialIntent number is treated as one
   * signal among several, not the business truth - see INTENT_TYPE_TIER above.
   *
   * finalScore =
   *   relevance * 0.4
   *   + commercialIntent * 0.4
   *   + INTENT_TYPE_TIER[intentType]   (0-15, business-priority tier, see above)
   *   + 8  (if a named competitor was matched - concrete replacement/switching signal)
   *   + 6  (if a problem summary was extracted - a real, articulated pain point)
   *   clamped to [0, 100]
   */
  calculateFinalScore(classification: ClassificationResult): number {
    const relevanceWeight = 0.4;
    const intentWeight = 0.4;
    const competitorBonus = 8;
    const problemSummaryBonus = 6;

    let score = 0;

    score += classification.relevance * relevanceWeight;
    score += classification.commercialIntent * intentWeight;
    score += INTENT_TYPE_TIER[classification.intentType] ?? 0;

    if (classification.matchedCompetitors.length > 0) {
      score += competitorBonus;
    }

    if (classification.problemSummary && classification.problemSummary.trim().length > 0) {
      score += problemSummaryBonus;
    }

    // Normalize to 100 max
    return Math.min(Math.max(Math.round(score), 0), 100);
  }
}
