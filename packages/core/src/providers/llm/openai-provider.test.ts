import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from './openai-provider';
import OpenAI from 'openai';

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(function() {
      return {
        chat: {
          completions: {
            parse: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    parsed: { success: true },
                    refusal: null
                  }
                }
              ]
            })
          }
        }
      };
    })
  };
});

describe('OpenAIProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test';
  });

  it('should use distinct models for classify and generateVocabulary', async () => {
    process.env.OPENAI_MODEL = 'model_A';
    process.env.OPENAI_VOCAB_MODEL = 'model_B';

    const provider = new OpenAIProvider();
    
    // Test classify uses model_A
    const openaiInstance = vi.mocked(OpenAI).mock.results[0]!.value;
    await provider.classify({
      projectConfig: { name: 'test', keywords: [], competitors: [] },
      post: { title: 'test', subreddit: 'test' }
    } as any);

    expect(openaiInstance.chat.completions.parse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model_A'
      })
    );

    // Test generateVocabulary uses model_B
    openaiInstance.chat.completions.parse.mockClear();
    await provider.generateVocabulary({ name: 'test', keywords: [], competitors: [] });

    expect(openaiInstance.chat.completions.parse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model_B'
      })
    );
  });
});
