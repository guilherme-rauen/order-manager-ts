export class OrderItem {
  public readonly productId: string;

  public readonly quantity: number;

  public readonly unitPrice: number;

  constructor({
    productId,
    quantity,
    unitPrice,
  }: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }) {
    this.productId = productId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }
}
