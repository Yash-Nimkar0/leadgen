import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { ExternalHttpClient, ExternalProviderError } from '../http-client';
import { ConfiguredProvider } from '../configured-provider';

// Mock the global fetch
const originalFetch = global.fetch;

describe('ConfiguredProvider and ExternalHttpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should normalize successful response', async () => {
    const mockResponse = {
      posts: [{
        id: '123',
        permalink: '/test',
        title: 'Test',
        text: 'Content',
        author: 'auth1',
        subreddit: 'comm1',
        created_utc: 1774446880
      }]
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const provider = new ConfiguredProvider();
    const result = await provider.fetch({ limit: 10, query: 'test' });
    
    expect(result).toHaveLength(1);
    expect(result[0]!.externalId).toBe('123');
    expect(result[0]!.title).toBe('Test');
    expect(result[0]!.body).toBe('Content');
  });

  it('should handle malformed JSON', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => { throw new SyntaxError("Unexpected token"); },
    });

    const client = new ExternalHttpClient({ maxRetries: 0 });
    
    await expect(client.get('/test')).rejects.toThrowError(ExternalProviderError);
    await expect(client.get('/test')).rejects.toThrowError('Malformed JSON response');
  });

  it('should handle missing optional fields', async () => {
    const mockResponse = {
      posts: [{
        id: '124',
        // Missing title, content, etc.
      }]
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const provider = new ConfiguredProvider();
    const result = await provider.fetch({ limit: 10 });
    
    expect(result[0]!.title).toBe('');
    expect(result[0]!.body).toBeNull();
  });

  it('should handle 401 Unauthorized', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Invalid API key'
    });

    const client = new ExternalHttpClient({ maxRetries: 0 });
    
    await expect(client.get('/test')).rejects.toThrowError('HTTP 401: Unauthorized - Invalid API key');
  });

  it('should handle 403 Forbidden', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => ''
    });

    const client = new ExternalHttpClient({ maxRetries: 0 });
    await expect(client.get('/test')).rejects.toThrowError('HTTP 403: Forbidden - ');
  });

  it('should retry on 429 Too Many Requests', async () => {
    let callCount = 0;
    (global.fetch as any).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { ok: false, status: 429, statusText: 'Too Many Requests' };
      }
      return { ok: true, json: async () => ({ success: true }) };
    });

    const client = new ExternalHttpClient({ maxRetries: 1 });
    
    const result = await client.get('/test');
    expect(result).toEqual({ success: true });
    expect(callCount).toBe(2);
  });

  it('should retry on 500 Internal Server Error', async () => {
    let callCount = 0;
    (global.fetch as any).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { ok: false, status: 500, statusText: 'Server Error' };
      }
      return { ok: true, json: async () => ({ success: true }) };
    });

    const client = new ExternalHttpClient({ maxRetries: 1 });
    
    const result = await client.get('/test');
    expect(result).toEqual({ success: true });
    expect(callCount).toBe(2);
  });

  it('should handle timeout', async () => {
    (global.fetch as any).mockImplementation(async () => {
      throw new Error("timeout");
    });

    const client = new ExternalHttpClient({ maxRetries: 0 });
    
    await expect(client.get('/test')).rejects.toThrowError('Network failure: timeout');
  });
});
