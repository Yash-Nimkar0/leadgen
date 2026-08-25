import { ILLMProvider, ClassificationInput, ClassificationResult, LLMError } from './interfaces';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { GroqProvider } from './groq-provider';
import { XAIProvider } from './xai-provider';

type ProviderFactory = () => ILLMProvider;

const providerFactories: Record<string, ProviderFactory> = {
  gemini: () => new GeminiProvider(),
  openai: () => new OpenAIProvider(),
  groq: () => new GroqProvider(),
  xai: () => new XAIProvider(),
};

export class LLMRouter implements ILLMProvider {
  private primaryName: string;
  private fallbackNames: string[];
  private providers: Map<string, ILLMProvider> = new Map();

  constructor() {
    this.primaryName = (process.env.LLM_PRIMARY_PROVIDER || 'gemini').toLowerCase().trim();
    const fallbacks = process.env.LLM_FALLBACK_PROVIDERS || 'groq,openai,xai';
    this.fallbackNames = fallbacks.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    // Initialize primary
    this.tryInitProvider(this.primaryName);
    
    // Initialize fallbacks
    for (const name of this.fallbackNames) {
      if (name !== this.primaryName) {
        this.tryInitProvider(name);
      }
    }
  }

  private tryInitProvider(name: string) {
    if (this.providers.has(name)) return;
    
    const factory = providerFactories[name];
    if (!factory) {
      console.warn(`LLMRouter: Unknown provider name '${name}'. Skipping.`);
      return;
    }

    try {
      const provider = factory();
      this.providers.set(name, provider);
    } catch (error: any) {
      console.warn(`LLMRouter: Failed to initialize provider '${name}': ${error.message}. Skipping.`);
    }
  }

  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    if (this.providers.size === 0) {
      throw new Error("LLMRouter: No providers could be initialized. Please check API keys and configurations.");
    }

    const order = [this.primaryName, ...this.fallbackNames].filter((v, i, a) => a.indexOf(v) === i);
    
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: LLMError | Error | null = null;

    for (const providerName of order) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      if (attempts >= maxAttempts) {
        console.warn(`LLMRouter: Reached maximum attempts limit (${maxAttempts}). Aborting routing.`);
        break;
      }

      attempts++;
      let retries = 0;
      const maxRetriesPerProvider = 1;

      while (retries <= maxRetriesPerProvider) {
        try {
          const startTime = Date.now();
          const result = await provider.classify(input);
          const latency = Date.now() - startTime;
          
          // Attach routing metadata for evaluation logging
          (result as any)._routerMetadata = {
            provider: providerName,
            fallbackDepth: attempts - 1,
            latency
          };
          
          return result;
        } catch (error: any) {
          const llmError = error instanceof LLMError ? error : new LLMError("UNKNOWN", error.message || String(error), providerName);
          lastError = llmError;
          
          // Log normalized event (we don't have a logger, using console)
          console.warn(`LLMRouter: Provider '${providerName}' failed. Category: ${llmError.category}. Error: ${llmError.message}`);

          // Determine if we should retry, fallback, or fail completely
          if (llmError.category === 'INVALID_REQUEST') {
            // Malformed request on our side - retrying/falling back won't help, hard fail
            throw llmError;
          }

          if (llmError.category === 'INVALID_RESPONSE') {
            // Provider returned an empty/unparseable response or refused to answer
            // (e.g. a safety refusal on adversarial content). Don't weaken the prompt to force
            // compliance - fall back to the next provider instead. No retry on the same
            // provider since a refusal is unlikely to change on immediate retry.
            break;
          }

          if (llmError.category === 'QUOTA_EXHAUSTED' || llmError.category === 'AUTHENTICATION_ERROR') {
            // Hard fail for this provider, do not retry, go to fallback
            break;
          }

          if (llmError.category === 'RATE_LIMITED' || llmError.category === 'TIMEOUT' || llmError.category === 'TEMPORARY_PROVIDER_ERROR') {
            if (retries < maxRetriesPerProvider) {
              retries++;
              console.log(`LLMRouter: Retrying '${providerName}' (attempt ${retries}/${maxRetriesPerProvider})...`);
              await new Promise(resolve => setTimeout(resolve, process.env.NODE_ENV === 'test' ? 1 : 2000)); // Small bounded delay
              continue;
            } else {
              // Max retries reached for this provider, go to fallback
              break;
            }
          }

          // For UNKNOWN or unhandled, break to fallback
          break;
        }
      }
    }

    throw new Error(`LLMRouter: All attempted providers failed. Last error: ${lastError?.message}`);
  }
}
