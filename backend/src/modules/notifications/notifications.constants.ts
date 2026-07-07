export const SMS_QUEUE = 'sms';

export interface SmsJobData {
  logId: string;
  mobile: string;
  message: string;
}
