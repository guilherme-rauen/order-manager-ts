export interface PaymentWebhookDto {
  amount: number;
  endpoint: string;
  orderId: string;
  provider: string;
  status: string;
  transactionId: string;
}
