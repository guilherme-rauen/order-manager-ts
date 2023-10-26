export interface PaymentWebhookDto {
  amount: number;
  orderId: string;
  provider: string;
  status: string;
  transactionId: string;
}
