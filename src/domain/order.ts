import { OrderItem } from './order-item';
import { OrderStatus } from './order-status';

export class Order {
  public customerId: string;

  public orderDate: Date;

  public orderId: string;

  public orderItems: OrderItem[];

  public status: OrderStatus;

  public totalAmount: number;

  constructor({
    orderId,
    orderDate,
    orderItems,
    customerId,
  }: {
    orderId: string;
    orderDate: Date;
    orderItems: OrderItem[];
    customerId: string;
  }) {
    this.customerId = customerId;
    this.orderDate = orderDate;
    this.orderId = orderId;
    this.orderItems = orderItems;
    this.status = OrderStatus.PENDING;
    this.totalAmount = this.calculateTotalAmount();
  }

  private calculateTotalAmount(): number {
    return this.orderItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  }
}
