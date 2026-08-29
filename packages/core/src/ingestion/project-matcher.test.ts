import { describe, it, expect, beforeEach } from "vitest";

import { ProjectMatcher } from './project-matcher';
import { SourcePost } from '../types';

describe('ProjectMatcher', () => {
  let matcher: ProjectMatcher;

  beforeEach(() => {
    matcher = new ProjectMatcher();
  });

  it('should bypass filter if provenance is EXACT_QUERY', () => {
    const post = {
      title: 'Completely unrelated text',
      body: 'No keywords here',
      subreddit: 'test',
      provenance: 'EXACT_QUERY'
    } as any;

    const project = {
      keywords: ['magic'],
      sources: []
    };

    const isMatch = matcher.isCandidate(post, project);
    expect(isMatch).toBe(true);
    expect((post as any).wouldHaveMatchedOldExactFilter).toBe(false);
  });

  it('should apply combination rule for BROAD_QUERY candidates', () => {
    const post = {
      title: 'Looking for a flat in Thane',
      subreddit: 'test',
      provenance: 'BROAD_QUERY'
    } as any;

    const project = {
      keywords: ['buy flat thane'],
      sources: [],
      vocabulary: {
        entities: ['flat'],
        intentTerms: ['looking for', 'buy']
      }
    };

    const isMatch = matcher.isCandidate(post, project);
    expect(isMatch).toBe(true);
  });

  it('should reject BROAD_QUERY if combination rule fails', () => {
    const post = {
      title: 'Just talking about a flat', // Has entity, but no intent/problem
      subreddit: 'test',
      provenance: 'BROAD_QUERY'
    } as any;

    const project = {
      keywords: ['buy flat thane'],
      sources: [],
      vocabulary: {
        entities: ['flat'],
        intentTerms: ['looking for', 'buy']
      }
    };

    const isMatch = matcher.isCandidate(post, project);
    expect(isMatch).toBe(false);
  });

  it('should treat BOTH as exact-match bypass', () => {
    const post = {
      title: 'Completely unrelated text',
      body: 'No keywords here',
      subreddit: 'test',
      provenance: 'BOTH'
    } as any;

    const project = {
      keywords: ['magic'],
      sources: []
    };

    const isMatch = matcher.isCandidate(post, project);
    expect(isMatch).toBe(true);
  });

  it('should not reject a BROAD_QUERY candidate if it contains an exclusion term', () => {
    const post = {
      title: 'Looking for a PG in Thane', // Contains PG (exclusion) but also intent and entity
      subreddit: 'test',
      provenance: 'BROAD_QUERY'
    } as any;

    const project = {
      keywords: ['buy flat thane'],
      sources: [],
      vocabulary: {
        entities: ['thane'],
        intentTerms: ['looking for'],
        exclusionTerms: ['pg']
      }
    };

    const isMatch = matcher.isCandidate(post, project);
    expect(isMatch).toBe(true); // Should pass pre-filter, LLM handles exclusion later
  });
});
