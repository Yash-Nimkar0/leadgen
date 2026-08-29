import { SourcePost } from '../types';

export class ProjectMatcher {
  /**
   * Deterministic filter to check if a post is a candidate for a project.
   */
  isCandidate(post: SourcePost, project: { keywords: string[], sources: string[], vocabulary?: any }): boolean {
    if (project.sources.length > 0) {
      const sourceMatch = project.sources.some(s => s.toLowerCase() === post.subreddit.toLowerCase());
      if (!sourceMatch) return false;
    }

    const searchString = `${post.title} ${post.body || ''}`.toLowerCase();

    // Calculate exact-filter legacy check
    (post as any).wouldHaveMatchedOldExactFilter = project.keywords.some(k => searchString.includes(k.toLowerCase()));

    // EXACT bypass
    if (post.provenance === 'EXACT_QUERY' || post.provenance === 'BOTH') {
      return true; // Bypass pre-filter
    }

    // BROAD combination rule
    if (post.provenance === 'BROAD_QUERY' && project.vocabulary) {
      const v = project.vocabulary;
      
      const entityContextPool = [...(v.entities||[]), ...(v.contexts||[]), ...(v.subtypes||[]), ...(v.synonyms||[])].map((s:string) => s.toLowerCase());
      const problemIntentPool = [...(v.problemTerms||[]), ...(v.intentTerms||[])].map((s:string) => s.toLowerCase());

      const matchesEntityContext = entityContextPool.some((t:string) => searchString.includes(t));
      const matchesProblemIntent = problemIntentPool.some((t:string) => searchString.includes(t));

      // Note on Exclusion Terms:
      // exclusionTerms are generated and persisted, but are NOT unconditional deterministic 
      // pre-filter rejection rules here. They remain available to the downstream LLM/ICP 
      // qualification layer for contextual judgment (so a false positive isn't rejected early).

      // The post must contain at least one entity/context AND at least one problem/intent
      if (matchesEntityContext && matchesProblemIntent) {
        return true;
      }
      return false;
    }

    // If no vocabulary or provenance missing, fallback to basic exact
    return project.keywords.length === 0 || (post as any).wouldHaveMatchedOldExactFilter;
  }
}
