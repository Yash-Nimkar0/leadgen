import Groq from 'groq-sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ILLMProvider, ClassificationInput, ClassificationResult, ClassificationResultSchema, LLMError, LLMErrorCategory, ProjectVocabularySchema } from './interfaces';
import { buildClassificationSystemPrompt, buildClassificationUserContent } from './prompt';
import { buildVocabularySystemPrompt } from './vocabulary-prompt';

export class GroqProvider implements ILLMProvider {
  private groq: Groq;
  public readonly model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is missing.');
    }
    
    this.model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    this.groq = new Groq({ apiKey });
  }

  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const systemPrompt = buildClassificationSystemPrompt(input.projectConfig);
    const userContent = buildClassificationUserContent(input.post);

    // Note: Groq does not have a parse() helper with Zod out of the box in standard SDK like OpenAI does natively yet,
    // but the `openai/gpt-oss-20b` supports JSON schema natively via response_format.
    
    // We must pass the JSON schema directly.
    // Cast the argument: ClassificationResultSchema's structural type is complex enough that
    // TS hits its instantiation depth limit (TS2589) trying to verify it against
    // zod-to-json-schema's ZodType parameter. Purely a type-checking limitation - this call
    // has run correctly at runtime throughout development.
    const jsonSchema = zodToJsonSchema(ClassificationResultSchema as any);
    if ('$schema' in jsonSchema) {
      delete (jsonSchema as any).$schema;
    }

    let completion;
    try {
      completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        response_format: { type: "json_schema", json_schema: { name: "classification", schema: jsonSchema, strict: true } },
        temperature: 0.1,
      });
    } catch (error: any) {
      throw this.mapError(error);
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new LLMError("INVALID_RESPONSE", "Groq returned an empty response.", "groq", this.model);
    }

    try {
      const parsed = JSON.parse(content);
      return ClassificationResultSchema.parse(parsed);
    } catch (error: any) {
      throw new LLMError("INVALID_RESPONSE", `Failed to parse or validate Groq response: ${error.message}`, "groq", this.model);
    }
  }

  async generateVocabulary(projectConfig: any): Promise<any> {
    const systemPrompt = buildVocabularySystemPrompt(projectConfig);
    const jsonSchema = zodToJsonSchema(ProjectVocabularySchema as any);
    if ('$schema' in jsonSchema) {
      delete (jsonSchema as any).$schema;
    }

    let completion;
    try {
      completion = await this.groq.chat.completions.create({
        model: this.model, // We use the same model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the structured retrieval vocabulary for this project.' }
        ],
        response_format: { type: "json_schema", json_schema: { name: "vocabulary", schema: jsonSchema, strict: true } },
        temperature: 0.1,
      });
    } catch (error: any) {
      throw this.mapError(error);
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new LLMError("INVALID_RESPONSE", "Groq returned an empty response.", "groq", this.model);
    }

    try {
      const parsed = JSON.parse(content);
      return ProjectVocabularySchema.parse(parsed);
    } catch (error: any) {
      throw new LLMError("INVALID_RESPONSE", `Failed to parse or validate Groq vocabulary: ${error.message}`, "groq", this.model);
    }
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

    return new LLMError(category, msg, "groq", this.model);
  }
}
