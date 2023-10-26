export class OrderCancelledEvent {
  public readonly orderId: string;

  constructor({ orderId }: { orderId: string }) {
    this.orderId = orderId;
  }
}
