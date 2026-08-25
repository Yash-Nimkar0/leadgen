import { PrismaClient, AlertStatus, AlertChannel, ProjectLeadStatus, IntentType, Prisma } from "@prisma/client";
import { INotificationProvider } from "../providers/notification";

function createEmailTemplate(lead: any, analysis: any, appUrl: string) {
  const leadUrl = `${appUrl}/projects/${lead.projectId}/leads/${lead.id}`;
  
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #1a1a1a;">High-intent opportunity found</h2>
      
      <p><strong>Opportunity:</strong> ${lead.redditPost.title}</p>
      
      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin-top: 0;"><strong>Intent Score:</strong> ${analysis.finalScore}</p>
        <p><strong>Intent Type:</strong> ${analysis.intentType}</p>
        <p><strong>Subreddit:</strong> r/${lead.redditPost.subreddit}</p>
      </div>

      ${analysis.problemSummary ? `<p><strong>Problem:</strong><br/>${analysis.problemSummary}</p>` : ''}
      
      ${analysis.matchedCompetitors?.length > 0 ? `<p><strong>Competitor:</strong><br/>${analysis.matchedCompetitors.join(', ')}</p>` : ''}
      
      <p><strong>Why this matters:</strong><br/>${analysis.whyItMatters}</p>
      
      <div style="margin-top: 32px;">
        <a href="${leadUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View Opportunity
        </a>
      </div>
    </div>
  `;
}

export class NotificationService {
  constructor(
    private prisma: PrismaClient,
    private provider: INotificationProvider,
    private appUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ) {}

  async processLead(leadId: string): Promise<boolean> {
    const lead = await this.prisma.projectLead.findUnique({
      where: { id: leadId },
      include: {
        analysis: true,
        redditPost: true,
        project: {
          include: {
            user: {
              include: {
                preferences: true
              }
            }
          }
        }
      }
    });

    if (!lead || !lead.analysis || !lead.project?.user) {
      return false; // Not eligible
    }

    const user = lead.project.user;
    if (!user.email) return false;

    if (lead.status === ProjectLeadStatus.DISMISSED || lead.analysis.intentType === IntentType.IRRELEVANT) {
      return false; // Not eligible
    }

    const minScore = user.preferences?.minimumIntentScore ?? 80;
    if (lead.analysis.finalScore < minScore) {
      return false; // Below threshold
    }

    // --- Idempotency & Database Lock ---
    let alertId: string | null = null;
    let shouldSend = false;

    try {
      // 1. Attempt to create a new PENDING alert
      // This relies on the unique constraint (projectLeadId, channel) to prevent races.
      const newAlert = await this.prisma.alert.create({
        data: {
          projectLeadId: leadId,
          channel: AlertChannel.EMAIL,
          status: AlertStatus.PENDING,
          attemptCount: 1,
          lastAttemptAt: new Date()
        }
      });
      alertId = newAlert.id;
      shouldSend = true;
    } catch (error) {
      // If it fails due to unique constraint, it means an alert already exists.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Fetch the existing alert
        const existingAlert = await this.prisma.alert.findUnique({
          where: {
            projectLeadId_channel: {
              projectLeadId: leadId,
              channel: AlertChannel.EMAIL
            }
          }
        });

        if (!existingAlert) return false;
        
        // If it's already sent, do nothing
        if (existingAlert.status === AlertStatus.SENT) {
          return false;
        }

        // Check retry logic for FAILED or stuck PENDING alerts
        if (existingAlert.attemptCount >= 3) {
          return false; // Max attempts reached
        }

        // For PENDING, let's say it needs to be stuck for > 5 minutes to be retried
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (existingAlert.status === AlertStatus.PENDING && existingAlert.lastAttemptAt && existingAlert.lastAttemptAt > fiveMinsAgo) {
          return false; // Another worker might be actively processing it
        }

        // Claim it for retry using updateMany to allow non-unique conditions
        try {
          const updateResult = await this.prisma.alert.updateMany({
            where: {
              id: existingAlert.id,
              status: existingAlert.status,
              attemptCount: existingAlert.attemptCount
            },
            data: {
              status: AlertStatus.PENDING,
              attemptCount: {
                increment: 1
              },
              lastAttemptAt: new Date()
            }
          });
          
          if (updateResult.count === 0) {
            // Another worker claimed it first
            return false;
          }
          
          alertId = existingAlert.id;
          shouldSend = true;
        } catch (claimError) {
          return false;
        }
      } else {
        throw error; // Unexpected database error
      }
    }

    if (!shouldSend || !alertId) {
      return false;
    }

    // --- Send Email ---
    const subject = `High-intent Reddit opportunity: ${lead.redditPost.title.substring(0, 50)}${lead.redditPost.title.length > 50 ? '...' : ''}`;
    const htmlBody = createEmailTemplate(lead, lead.analysis, this.appUrl);

    const result = await this.provider.send({
      to: user.email,
      subject,
      htmlBody
    });

    // --- Update State ---
    if (result.success) {
      await this.prisma.alert.update({
        where: { id: alertId },
        data: {
          status: AlertStatus.SENT,
          sentAt: new Date(),
          providerMessageId: result.messageId
        }
      });
      return true;
    } else {
      // Determine if it was a transient error (can be retried) or permanent
      const isTransient = result.isTransientError ?? true;
      const finalAttemptCount = isTransient ? undefined : 3;

      await this.prisma.alert.update({
        where: { id: alertId },
        data: {
          status: AlertStatus.FAILED,
          failureReason: result.error?.substring(0, 255),
          ...(finalAttemptCount !== undefined && { attemptCount: finalAttemptCount })
        }
      });
      return false;
    }
  }
}
