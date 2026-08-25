import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ILLMProvider, ClassificationInput, ClassificationResult, ClassificationResultSchema, LLMError, LLMErrorCategory } from './interfaces';
import { buildClassificationSystemPrompt, buildClassificationUserContent } from './prompt';

export class XAIProvider implements ILLMProvider {
  private openai: OpenAI;
  public readonly model: string;

  constructor() {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error('XAI_API_KEY environment variable is missing.');
    }

    const configuredModel = process.env.XAI_MODEL;
    if (!configuredModel) {
      throw new Error('XAI_MODEL environment variable is missing. It must be explicitly configured after verifying available models.');
    }
    
    this.model = configuredModel;
    
    this.openai = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.x.ai/v1',
    });
  }

  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const systemPrompt = buildClassificationSystemPrompt(input.projectConfig);
    const userContent = buildClassificationUserContent(input.post);

    let completion;
    try {
      completion = await this.openai.chat.completions.parse({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        response_format: zodResponseFormat(ClassificationResultSchema, 'classification_result'),
        temperature: 0.1,
      });
    } catch (error: any) {
      throw this.mapError(error);
    }

    const result = completion.choices[0]?.message.parsed;
    const refusal = completion.choices[0]?.message.refusal;

    if (refusal) {
      throw new LLMError("INVALID_RESPONSE", `xAI refused to classify: ${refusal}`, "xai", this.model);
    }

    if (!result) {
      throw new LLMError("INVALID_RESPONSE", "xAI returned an empty or unparseable response.", "xai", this.model);
    }

    return result;
  }

  private mapError(error: any): LLMError {
    const status = error.status;
    const msg = error.message || String(error);

    let category: LLMErrorCategory = "UNKNOWN";

    if (error.name === 'RateLimitError' || status === 429) {
      if (msg.toLowerCase().includes('quota')) {
        category = "QUOTA_EXHAUSTED";
      } else {
        category = "RATE_LIMITED";
      }
    } else if (error.name === 'AuthenticationError' || status === 401) {
      category = "AUTHENTICATION_ERROR";
    } else if (error.name === 'BadRequestError' || status === 400 || error.name === 'NotFoundError' || status === 404) {
      category = "INVALID_REQUEST";
    } else if (error.name === 'APITimeoutError' || status === 408 || msg.includes('timeout')) {
      category = "TIMEOUT";
    } else if (error.name === 'InternalServerError' || status >= 500) {
      category = "TEMPORARY_PROVIDER_ERROR";
    }

    return new LLMError(category, msg, "xai", this.model);
  }
}
