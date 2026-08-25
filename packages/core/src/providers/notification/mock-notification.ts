import { INotificationProvider, NotificationInput, NotificationResult } from "./interfaces";

export class MockNotificationProvider implements INotificationProvider {
  public sentEmails: { input: NotificationInput; sentAt: Date }[] = [];
  public shouldFail: boolean = false;
  public failReason: string = "Mock failure";
  public transientFailure: boolean = false;

  async send(input: NotificationInput): Promise<NotificationResult> {
    if (this.shouldFail) {
      return {
        success: false,
        error: this.failReason,
        isTransientError: this.transientFailure,
      };
    }

    this.sentEmails.push({ input, sentAt: new Date() });

    return {
      success: true,
      messageId: `mock_msg_${Math.random().toString(36).substring(7)}`,
    };
  }

  clear() {
    this.sentEmails = [];
    this.shouldFail = false;
    this.failReason = "Mock failure";
    this.transientFailure = false;
  }
}
