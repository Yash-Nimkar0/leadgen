export interface NotificationInput {
  to: string;
  subject: string;
  htmlBody: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isTransientError?: boolean;
}

export interface INotificationProvider {
  send(input: NotificationInput): Promise<NotificationResult>;
}
