import { Resend } from 'resend';
import { INotificationProvider, NotificationInput, NotificationResult } from './interfaces';

export class ResendEmailProvider implements INotificationProvider {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'Reddit Intent <onboarding@resend.dev>';
    
    // We instantiate it even if apiKey is undefined; it will fail nicely on send.
    // In production, we'd ensure it's provided.
    this.resend = new Resend(apiKey || 'mock_key');
  }

  async send(input: NotificationInput): Promise<NotificationResult> {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: "RESEND_API_KEY is not configured.",
        isTransientError: true, // we might configure it later and retry
      };
    }

    try {
      const data = await this.resend.emails.send({
        from: this.fromEmail,
        to: input.to,
        subject: input.subject,
        html: input.htmlBody,
      });

      if (data.error) {
        return {
          success: false,
          error: data.error.message,
          isTransientError: this.isTransient(data.error.name),
        };
      }

      return {
        success: true,
        messageId: data.data?.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown Resend error',
        isTransientError: true, // treat unknown network errors as transient
      };
    }
  }

  private isTransient(errorName: string): boolean {
    // Resend specific transient vs permanent errors
    // Examples of permanent: "validation_error", "missing_required_field"
    // Examples of transient: "internal_server_error", "rate_limit_exceeded"
    const permanentErrors = ['validation_error', 'missing_required_field', 'invalid_api_key'];
    return !permanentErrors.includes(errorName);
  }
}
