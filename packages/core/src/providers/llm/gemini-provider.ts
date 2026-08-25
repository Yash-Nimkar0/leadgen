import { GoogleGenAI, Type, Schema } from '@google/genai';
import { ILLMProvider, ClassificationInput, ClassificationResult, ClassificationResultSchema, LLMError, LLMErrorCategory } from './interfaces';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { buildClassificationSystemPrompt, buildClassificationUserContent } from './prompt';

export class GeminiProvider implements ILLMProvider {
  private ai: GoogleGenAI;
  public readonly model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    
    this.model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    this.ai = new GoogleGenAI({ apiKey });
  }

  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const systemPrompt = buildClassificationSystemPrompt(input.projectConfig);
    const userContent = buildClassificationUserContent(input.post);

    // Cast the argument: ClassificationResultSchema's structural type is complex enough that
    // TS hits its instantiation depth limit (TS2589) trying to verify it against
    // zod-to-json-schema's ZodType parameter. Purely a type-checking limitation - this call
    // has run correctly at runtime throughout development.
    const zodSchema = zodToJsonSchema(ClassificationResultSchema as any) as any;
    
    const toGeminiSchema = (schema: any): Schema => {
        if (schema.type === 'object') {
            const properties: Record<string, Schema> = {};
            for (const key in schema.properties) {
                properties[key] = toGeminiSchema(schema.properties[key]);
            }
            return {
                type: Type.OBJECT,
                properties,
                required: schema.required,
                description: schema.description,
            };
        }
        if (schema.type === 'array') {
            return {
                type: Type.ARRAY,
                items: toGeminiSchema(schema.items),
                description: schema.description,
            };
        }
        if (schema.type === 'string' && schema.enum) {
            return {
                type: Type.STRING,
                enum: schema.enum,
                description: schema.description,
            };
        }
        if (schema.type === 'string') return { type: Type.STRING, description: schema.description, nullable: schema.nullable };
        if (schema.type === 'number') return { type: Type.NUMBER, description: schema.description, nullable: schema.nullable };
        if (schema.type === 'boolean') return { type: Type.BOOLEAN, description: schema.description, nullable: schema.nullable };
        
        if (schema.anyOf) {
            const mainType = schema.anyOf.find((s: any) => s.type !== 'null');
            const res = toGeminiSchema(mainType);
            res.nullable = true;
            return res;
        }

        return { type: Type.STRING };
    };

    const responseSchema = toGeminiSchema(zodSchema);

    let response;
    try {
      response = await this.ai.models.generateContent({
        model: this.model,
        contents: userContent,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });
    } catch (error: any) {
      throw this.mapError(error);
    }

    if (!response.text) {
      throw new LLMError("INVALID_RESPONSE", "Gemini returned an empty response.", "gemini", this.model);
    }

    try {
      const parsed = JSON.parse(response.text);
      return ClassificationResultSchema.parse(parsed);
    } catch (error: any) {
      throw new LLMError("INVALID_RESPONSE", `Failed to parse or validate Gemini response: ${error.message}`, "gemini", this.model);
    }
  }

  private mapError(error: any): LLMError {
    const status = error.status || error.code;
    const msg = error.message || String(error);

    let category: LLMErrorCategory = "UNKNOWN";

    if (msg.includes("429") || status === 429 || status === "RESOURCE_EXHAUSTED") {
      // Differentiate between generic rate limit and exhausted quota
      if (msg.toLowerCase().includes("quota exceeded") && msg.toLowerCase().includes("perday")) {
        category = "QUOTA_EXHAUSTED";
      } else {
        category = "RATE_LIMITED";
      }
    } else if (msg.includes("401") || msg.includes("403") || status === 401 || status === 403 || status === "PERMISSION_DENIED") {
      category = "AUTHENTICATION_ERROR";
    } else if (msg.includes("400") || status === 400 || status === "INVALID_ARGUMENT" || msg.includes("404") || status === 404 || status === "NOT_FOUND") {
      category = "INVALID_REQUEST";
    } else if (msg.includes("timeout") || msg.includes("ECONNRESET")) {
      category = "TIMEOUT";
    } else if (msg.includes("500") || msg.includes("503") || status === 500 || status === 503) {
      category = "TEMPORARY_PROVIDER_ERROR";
    }

    return new LLMError(category, msg, "gemini", this.model);
  }
}
