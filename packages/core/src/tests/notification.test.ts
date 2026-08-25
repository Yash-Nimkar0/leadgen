import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectLeadStatus, IntentType, AlertStatus } from '@prisma/client';
import { NotificationService } from '../notification/NotificationService';
import { MockNotificationProvider } from '../providers/notification/mock-notification';

describe('NotificationService - Pure Logic Unit Tests', () => {
  let mockProvider: MockNotificationProvider;
  let mockPrisma: any;
  let notificationService: NotificationService;

  beforeEach(() => {
    mockProvider = new MockNotificationProvider();
    
    // Create a mock Prisma client that intercepts the calls made by NotificationService
    mockPrisma = {
      projectLead: {
        findUnique: vi.fn()
      },
      alert: {
        create: vi.fn(),
        findUnique: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn()
      }
    };

    notificationService = new NotificationService(mockPrisma as any, mockProvider);
  });

  const baseLead = {
    id: 'lead-1',
    status: ProjectLeadStatus.NEW,
    analysis: {
      intentType: IntentType.ACTIVE_PURCHASE,
      intentScore: 85,
      finalScore: 85,
    },
    project: {
      user: {
        email: 'test@example.com',
        preferences: {
          minimumIntentScore: 80
        }
      }
    },
    redditPost: {
      title: 'Test Post',
      subreddit: 'test'
    }
  };

  it('should reject if lead is not found', async () => {
    mockPrisma.projectLead.findUnique.mockResolvedValue(null);
    const result = await notificationService.processLead('lead-1');
    expect(result).toBe(false);
  });

  it('should reject if user email is missing', async () => {
    mockPrisma.projectLead.findUnique.mockResolvedValue({
      ...baseLead,
      project: { user: { email: null } }
    });
    const result = await notificationService.processLead('lead-1');
    expect(result).toBe(false);
  });

  it('should reject if lead is dismissed', async () => {
    mockPrisma.projectLead.findUnique.mockResolvedValue({
      ...baseLead,
      status: ProjectLeadStatus.DISMISSED
    });
    const result = await notificationService.processLead('lead-1');
    expect(result).toBe(false);
  });

  it('should reject if intent type is IRRELEVANT', async () => {
    mockPrisma.projectLead.findUnique.mockResolvedValue({
      ...baseLead,
      analysis: { ...baseLead.analysis, intentType: IntentType.IRRELEVANT }
    });
    const result = await notificationService.processLead('lead-1');
    expect(result).toBe(false);
  });

  it('should reject if final score is below threshold', async () => {
    mockPrisma.projectLead.findUnique.mockResolvedValue({
      ...baseLead,
      analysis: { ...baseLead.analysis, finalScore: 79 }
    });
    const result = await notificationService.processLead('lead-1');
    expect(result).toBe(false);
  });

  it('should proceed even if raw intentScore is below threshold, as long as finalScore clears it', async () => {
    // finalScore is the deterministic business score that gates notifications; the raw
    // LLM intentScore signal alone should not determine eligibility.
    mockPrisma.projectLead.findUnique.mockResolvedValue({
      ...baseLead,
      analysis: { ...baseLead.analysis, intentScore: 40, finalScore: 85 }
    });
    mockPrisma.alert.create.mockResolvedValue({ id: 'alert-1' });
    mockPrisma.alert.update.mockResolvedValue({});
    const result = await notificationService.processLead('lead-1');
    expect(result).toBe(true);
  });

  it('should proceed if eligibility rules are met and alert creates successfully', async () => {
    mockPrisma.projectLead.findUnique.mockResolvedValue(baseLead);
    mockPrisma.alert.create.mockResolvedValue({ id: 'alert-1' });
    mockPrisma.alert.update.mockResolvedValue({});

    const result = await notificationService.processLead('lead-1');
    
    expect(result).toBe(true);
    expect(mockProvider.sentEmails.length).toBe(1);
    expect(mockPrisma.alert.create).toHaveBeenCalled();
    expect(mockPrisma.alert.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: AlertStatus.SENT })
    }));
  });

  it('should classify failures as transient or permanent', async () => {
    mockPrisma.projectLead.findUnique.mockResolvedValue(baseLead);
    mockPrisma.alert.create.mockResolvedValue({ id: 'alert-1' });
    mockPrisma.alert.update.mockResolvedValue({});

    mockProvider.shouldFail = true;
    mockProvider.transientFailure = false; // permanent failure

    const result = await notificationService.processLead('lead-1');
    
    expect(result).toBe(false);
    expect(mockPrisma.alert.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ 
        status: AlertStatus.FAILED,
        attemptCount: 3 // Should max out attempts on permanent failure
      })
    }));
  });
});
