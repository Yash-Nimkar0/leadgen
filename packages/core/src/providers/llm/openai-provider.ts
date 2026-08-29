import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ILLMProvider, ClassificationInput, ClassificationResult, ClassificationResultSchema, LLMError, LLMErrorCategory, ProjectVocabularySchema } from './interfaces';
import { buildClassificationSystemPrompt, buildClassificationUserContent } from './prompt';
import { buildVocabularySystemPrompt } from './vocabulary-prompt';

export class OpenAIProvider implements ILLMProvider {
  private openai: OpenAI;
  public readonly classificationModel: string;
  public readonly vocabModel: string;

  // ILLMProvider expects a model property, we can return classificationModel for backwards compatibility
  get model(): string {
    return this.classificationModel;
  }

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is missing.');
    }
    
    this.classificationModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.vocabModel = process.env.OPENAI_VOCAB_MODEL || 'gpt-4o-mini';
    this.openai = new OpenAI({ apiKey });
  }

  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const systemPrompt = buildClassificationSystemPrompt(input.projectConfig);
    const userContent = buildClassificationUserContent(input.post);

    let completion;
    try {
      completion = await this.openai.chat.completions.parse({
        model: this.classificationModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        response_format: zodResponseFormat(ClassificationResultSchema, 'classification_result'),
        temperature: 0.1, // Keep it deterministic
      });
    } catch (error: any) {
      throw this.mapError(error, this.classificationModel);
    }

    const result = completion.choices[0]?.message.parsed;
    const refusal = completion.choices[0]?.message.refusal;

    if (refusal) {
      throw new LLMError("INVALID_RESPONSE", `OpenAI refused to classify: ${refusal}`, "openai", this.classificationModel);
    }

    if (!result) {
      throw new LLMError("INVALID_RESPONSE", "OpenAI returned an empty or unparseable response.", "openai", this.classificationModel);
    }

    return result;
  }

  async generateVocabulary(projectConfig: any): Promise<any> {
    const systemPrompt = buildVocabularySystemPrompt(projectConfig);

    let completion;
    try {
      completion = await this.openai.chat.completions.parse({
        model: this.vocabModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the structured retrieval vocabulary for this project.' },
        ],
        response_format: zodResponseFormat(ProjectVocabularySchema, 'vocabulary'),
        temperature: 0.1,
      });
    } catch (error: any) {
      throw this.mapError(error, this.vocabModel);
    }

    const result = completion.choices[0]?.message.parsed;
    const refusal = completion.choices[0]?.message.refusal;

    if (refusal) {
      throw new LLMError("INVALID_RESPONSE", `OpenAI refused to generate vocabulary: ${refusal}`, "openai", this.vocabModel);
    }

    if (!result) {
      throw new LLMError("INVALID_RESPONSE", "OpenAI returned an empty or unparseable response.", "openai", this.vocabModel);
    }

    return result;
  }

  private mapError(error: any, modelName: string): LLMError {
    const status = error.status;
    const msg = error.message || String(error);

    let category: LLMErrorCategory = "UNKNOWN";

    if (error.name === 'RateLimitError' || status === 429) {
      if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exceeded your current quota')) {
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

    return new LLMError(category, msg, "openai", modelName);
  }
}
