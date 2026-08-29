import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMRouter } from './llm-router';
import { ILLMProvider, ClassificationInput, ClassificationResult, LLMError } from './interfaces';
import { GeminiProvider } from './gemini-provider';

const mockInput: ClassificationInput = {
  projectConfig: { name: 'test', description: 'test', keywords: [], competitors: [] },
  post: { title: 'test', body: 'test', subreddit: 'test' }
};

const mockResult: ClassificationResult = {
  intentType: 'IRRELEVANT',
  commercialIntent: 0,
  relevance: 0,
  problemSummary: null,
  matchedKeywords: [],
  matchedCompetitors: [],
  buyingStage: 'Unaware',
  summary: 'test',
  whyItMatters: 'test',
  recommendedPriority: 'LOW'
};

class MockProvider implements ILLMProvider {
  constructor(public shouldFailWith?: LLMError, public successResult?: ClassificationResult) {}
  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    if (this.shouldFailWith) throw this.shouldFailWith;
    return this.successResult || mockResult;
  }
}

describe('LLMRouter', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.LLM_PRIMARY_PROVIDER = 'mock_primary';
    process.env.LLM_FALLBACK_PROVIDERS = 'mock_fallback_1,mock_fallback_2';
  });

  it('should return result from primary provider without fallback', async () => {
    const primary = new MockProvider(undefined, mockResult);
    const fallback = new MockProvider(new Error('Should not be called') as any);
    
    // Inject mock into factories for test
    const router = new LLMRouter();
    (router as any).providers.set('mock_primary', primary);
    (router as any).providers.set('mock_fallback_1', fallback);
    (router as any).primaryName = 'mock_primary';
    (router as any).fallbackNames = ['mock_fallback_1'];

    const res = await router.classify(mockInput);
    expect((res as any)._routerMetadata.provider).toBe('mock_primary');
    expect((res as any)._routerMetadata.fallbackDepth).toBe(0);
  });

  it('should fallback on RATE_LIMITED error', async () => {
    const primary = new MockProvider(new LLMError('RATE_LIMITED', 'Rate limit', 'mock_primary'));
    const fallback = new MockProvider(undefined, mockResult);
    
    const router = new LLMRouter();
    (router as any).providers.set('mock_primary', primary);
    (router as any).providers.set('mock_fallback_1', fallback);
    (router as any).primaryName = 'mock_primary';
    (router as any).fallbackNames = ['mock_fallback_1'];

    const res = await router.classify(mockInput);
    expect((res as any)._routerMetadata.provider).toBe('mock_fallback_1');
    expect((res as any)._routerMetadata.fallbackDepth).toBe(1);
  });

  it('should immediately fallback on QUOTA_EXHAUSTED without retries', async () => {
    const primarySpy = vi.fn().mockRejectedValue(new LLMError('QUOTA_EXHAUSTED', 'Quota exhausted', 'mock_primary'));
    const fallbackSpy = vi.fn().mockResolvedValue(mockResult);

    const primary = { classify: primarySpy };
    const fallback = { classify: fallbackSpy };
    
    const router = new LLMRouter();
    (router as any).providers.set('mock_primary', primary);
    (router as any).providers.set('mock_fallback_1', fallback);
    (router as any).primaryName = 'mock_primary';
    (router as any).fallbackNames = ['mock_fallback_1'];

    const res = await router.classify(mockInput);
    
    expect(primarySpy).toHaveBeenCalledTimes(1); // No retries
    expect(fallbackSpy).toHaveBeenCalledTimes(1);
    expect((res as any)._routerMetadata.provider).toBe('mock_fallback_1');
  });

  it('should immediately fallback on AUTHENTICATION_ERROR without retries', async () => {
    const primarySpy = vi.fn().mockRejectedValue(new LLMError('AUTHENTICATION_ERROR', 'Invalid key', 'mock_primary'));
    const fallbackSpy = vi.fn().mockResolvedValue(mockResult);

    const primary = { classify: primarySpy };
    const fallback = { classify: fallbackSpy };
    
    const router = new LLMRouter();
    (router as any).providers.set('mock_primary', primary);
    (router as any).providers.set('mock_fallback_1', fallback);
    (router as any).primaryName = 'mock_primary';
    (router as any).fallbackNames = ['mock_fallback_1'];

    const res = await router.classify(mockInput);
    
    expect(primarySpy).toHaveBeenCalledTimes(1);
    expect(fallbackSpy).toHaveBeenCalledTimes(1);
    expect((res as any)._routerMetadata.provider).toBe('mock_fallback_1');
  });

  it('should not fallback on INVALID_REQUEST', async () => {
    const primary = new MockProvider(new LLMError('INVALID_REQUEST', 'Bad request', 'mock_primary'));
    const fallbackSpy = vi.fn().mockResolvedValue(mockResult);
    const fallback = { classify: fallbackSpy };
    
    const router = new LLMRouter();
    (router as any).providers.set('mock_primary', primary);
    (router as any).providers.set('mock_fallback_1', fallback);
    (router as any).primaryName = 'mock_primary';
    (router as any).fallbackNames = ['mock_fallback_1'];

    await expect(router.classify(mockInput)).rejects.toThrow('Bad request');
    expect(fallbackSpy).not.toHaveBeenCalled();
  });

  it('should fallback on INVALID_RESPONSE (e.g. provider refusal) without retrying the same provider', async () => {
    const primarySpy = vi.fn().mockRejectedValue(new LLMError('INVALID_RESPONSE', 'Refused to classify', 'mock_primary'));
    const fallbackSpy = vi.fn().mockResolvedValue(mockResult);

    const primary = { classify: primarySpy };
    const fallback = { classify: fallbackSpy };

    const router = new LLMRouter();
    (router as any).providers.set('mock_primary', primary);
    (router as any).providers.set('mock_fallback_1', fallback);
    (router as any).primaryName = 'mock_primary';
    (router as any).fallbackNames = ['mock_fallback_1'];

    const res = await router.classify(mockInput);

    expect(primarySpy).toHaveBeenCalledTimes(1); // No retry on the refusing provider
    expect(fallbackSpy).toHaveBeenCalledTimes(1);
    expect((res as any)._routerMetadata.provider).toBe('mock_fallback_1');
  });

  it('should enforce maximum 3 providers attempted', async () => {
    const p1 = new MockProvider(new LLMError('TIMEOUT', 'T1', 'p1'));
    const p2 = new MockProvider(new LLMError('TIMEOUT', 'T2', 'p2'));
    const p3 = new MockProvider(new LLMError('TIMEOUT', 'T3', 'p3'));
    const p4Spy = vi.fn().mockResolvedValue(mockResult);
    const p4 = { classify: p4Spy };
    
    const router = new LLMRouter();
    (router as any).providers.set('p1', p1);
    (router as any).providers.set('p2', p2);
    (router as any).providers.set('p3', p3);
    (router as any).providers.set('p4', p4);
    (router as any).primaryName = 'p1';
    (router as any).fallbackNames = ['p2', 'p3', 'p4'];

    await expect(router.classify(mockInput)).rejects.toThrow();
    expect(p4Spy).not.toHaveBeenCalled();
  });

  it('should throw if no providers configured', async () => {
    process.env.LLM_PRIMARY_PROVIDER = 'non_existent';
    process.env.LLM_FALLBACK_PROVIDERS = 'also_non_existent';
    const router = new LLMRouter();
    await expect(router.classify(mockInput)).rejects.toThrow('LLMRouter: No providers could be initialized');
  });
});

describe('LLMRouter - Vocabulary Generation', () => {
  const mockConfig = { name: 'test' };

  it('should use openai as primary and not call groq on success', async () => {
    const openaiSpy = vi.fn().mockResolvedValue({ entities: ['test'] });
    const groqSpy = vi.fn();

    const router = new LLMRouter();
    (router as any).providers.set('openai', { generateVocabulary: openaiSpy, model: 'gpt-4o-mini' });
    (router as any).providers.set('groq', { generateVocabulary: groqSpy, model: 'llama-3' });

    const result = await router.generateVocabulary(mockConfig);
    
    expect(openaiSpy).toHaveBeenCalledTimes(1);
    expect(groqSpy).not.toHaveBeenCalled();
    expect((result as any)._routerMetadata.provider).toBe('openai');
    expect((result as any)._routerMetadata.model).toBe('gpt-4o-mini');
  });

  it('should fallback to groq on openai RATE_LIMITED', async () => {
    const openaiSpy = vi.fn().mockRejectedValue(new LLMError('RATE_LIMITED', 'rate limit', 'openai'));
    const groqSpy = vi.fn().mockResolvedValue({ entities: ['test'] });

    const router = new LLMRouter();
    (router as any).providers.set('openai', { generateVocabulary: openaiSpy, model: 'gpt-4o-mini' });
    (router as any).providers.set('groq', { generateVocabulary: groqSpy, model: 'llama-3' });

    const result = await router.generateVocabulary(mockConfig);

    expect(openaiSpy).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
    expect(groqSpy).toHaveBeenCalledTimes(1);
    expect((result as any)._routerMetadata.provider).toBe('groq');
  });

  it('should fallback to groq on openai TIMEOUT', async () => {
    const openaiSpy = vi.fn().mockRejectedValue(new LLMError('TIMEOUT', 'timeout', 'openai'));
    const groqSpy = vi.fn().mockResolvedValue({ entities: ['test'] });

    const router = new LLMRouter();
    (router as any).providers.set('openai', { generateVocabulary: openaiSpy, model: 'gpt-4o-mini' });
    (router as any).providers.set('groq', { generateVocabulary: groqSpy, model: 'llama-3' });

    const result = await router.generateVocabulary(mockConfig);

    expect(openaiSpy).toHaveBeenCalledTimes(2);
    expect(groqSpy).toHaveBeenCalledTimes(1);
    expect((result as any)._routerMetadata.provider).toBe('groq');
  });

  it('should fallback to groq on openai INVALID_RESPONSE (malformed output)', async () => {
    const openaiSpy = vi.fn().mockRejectedValue(new LLMError('INVALID_RESPONSE', 'malformed', 'openai'));
    const groqSpy = vi.fn().mockResolvedValue({ entities: ['test'] });

    const router = new LLMRouter();
    (router as any).providers.set('openai', { generateVocabulary: openaiSpy, model: 'gpt-4o-mini' });
    (router as any).providers.set('groq', { generateVocabulary: groqSpy, model: 'llama-3' });

    const result = await router.generateVocabulary(mockConfig);

    expect(openaiSpy).toHaveBeenCalledTimes(1); // No retries for INVALID_RESPONSE
    expect(groqSpy).toHaveBeenCalledTimes(1);
    expect((result as any)._routerMetadata.provider).toBe('groq');
  });

  it('should throw if both openai and groq fail', async () => {
    const openaiSpy = vi.fn().mockRejectedValue(new LLMError('TIMEOUT', 'timeout', 'openai'));
    const groqSpy = vi.fn().mockRejectedValue(new LLMError('INVALID_RESPONSE', 'bad', 'groq'));

    const router = new LLMRouter();
    (router as any).providers.set('openai', { generateVocabulary: openaiSpy, model: 'gpt-4o-mini' });
    (router as any).providers.set('groq', { generateVocabulary: groqSpy, model: 'llama-3' });

    await expect(router.generateVocabulary(mockConfig)).rejects.toThrow('All vocabulary-capable providers failed.');
  });
});
