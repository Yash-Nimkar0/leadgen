export class ExternalProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ExternalProviderError';
  }
}

export interface HttpClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxRetries?: number;
}

export class ExternalHttpClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost';
    this.headers = config.headers || {};
    this.timeoutMs = config.timeoutMs || 10000;
    this.maxRetries = config.maxRetries ?? 2;
  }

  async get<T>(path: string, queryParams?: Record<string, string>): Promise<T> {
    console.log("Fetching: ", path, queryParams); const url = new URL(`${this.baseUrl}${path}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: this.headers,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const isTransient = response.status === 408 || response.status === 429 || response.status >= 500;
          if (isTransient && attempt <= this.maxRetries) {
            await this.delay(1000 * Math.pow(2, attempt - 1));
            continue;
          }
          
          let errorBody = '';
          try {
            errorBody = await response.text();
          } catch (e) {
            // Ignore
          }
          
          throw new ExternalProviderError(
            `HTTP ${response.status}: ${response.statusText} - ${errorBody}`,
            response.status
          );
        }

        const data = await response.json();
        return data as T;
        
      } catch (error: any) {
        if (error instanceof ExternalProviderError) {
          throw error;
        }
        
        const isTimeout = error.name === 'AbortError' || error.message.includes('timeout');
        if (isTimeout && attempt <= this.maxRetries) {
          await this.delay(1000 * Math.pow(2, attempt - 1));
          continue;
        }

        if (error.name === 'SyntaxError') {
           throw new ExternalProviderError('Malformed JSON response', undefined, 'JSON_ERROR');
        }

        if (attempt > this.maxRetries) {
          throw new ExternalProviderError(`Network failure: ${error.message}`, undefined, 'NETWORK_ERROR');
        }
        
        await this.delay(1000 * Math.pow(2, attempt - 1));
      }
    }
    
    throw new ExternalProviderError('Exceeded max retries');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
