export const SMS_SENDER = Symbol('SMS_SENDER');

export interface SmsSender {
  send(mobile: string, text: string): Promise<void>;
  sendOtp(mobile: string, code: string): Promise<void>;
}
