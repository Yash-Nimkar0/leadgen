import { createHash } from 'crypto';
import { SourcePost } from '../types';
import { IPostRepository } from '../repositories/interfaces';

export class Deduplicator {
  constructor(private postRepo: IPostRepository) {}

  generateContentHash(post: SourcePost): string {
    const content = `${post.title}|${post.body || ''}`;
    return createHash('sha256').update(content).digest('hex');
  }

  async isDuplicate(post: SourcePost): Promise<boolean> {
    return this.postRepo.existsByExternalId(post.externalId);
  }
}
