export class ShipmentDispatchedEvent {
  public readonly carrier: string;

  public readonly orderId: string;

  public readonly trackingCode: string;

  constructor({
    carrier,
    orderId,
    trackingCode,
  }: {
    carrier: string;
    orderId: string;
    trackingCode: string;
  }) {
    this.carrier = carrier;
    this.orderId = orderId;
    this.trackingCode = trackingCode;
  }
}
