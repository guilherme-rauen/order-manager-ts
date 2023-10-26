export class PaymentConfirmedEvent {
  public readonly amount: number;

  public readonly orderId: string;

  public readonly provider: string;

  public readonly transactionId: string;

  constructor({
    amount,
    orderId,
    provider,
    transactionId,
  }: {
    amount: number;
    orderId: string;
    provider: string;
    transactionId: string;
  }) {
    this.amount = amount;
    this.orderId = orderId;
    this.provider = provider;
    this.transactionId = transactionId;
  }
}
