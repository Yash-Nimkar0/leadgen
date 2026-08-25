import { SourcePost } from '../types';

export class ProjectMatcher {
  /**
   * Deterministic filter to check if a post is a candidate for a project.
   * This is a cheap pre-filter before sending to the expensive LLM.
   */
  isCandidate(post: SourcePost, project: { keywords: string[], sources: string[] }): boolean {
    // If the project specifies sources (e.g. subreddits), ensure it matches.
    // Assuming sources is an array of subreddit names for now.
    if (project.sources.length > 0) {
      const sourceMatch = project.sources.some(s => s.toLowerCase() === post.subreddit.toLowerCase());
      if (!sourceMatch) return false;
    }

    // Check if any keyword matches the title or body
    if (project.keywords.length > 0) {
      const searchString = `${post.title} ${post.body || ''}`.toLowerCase();
      const keywordMatch = project.keywords.some(k => searchString.includes(k.toLowerCase()));
      if (!keywordMatch) return false;
    }

    return true; // If no keywords specified, or it matches, it's a candidate
  }
}
