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
    status,
    customerId,
  }: {
    orderId: string;
    orderDate: Date;
    orderItems: OrderItem[];
    status: OrderStatus;
    customerId: string;
  }) {
    this.customerId = customerId;
    this.orderDate = orderDate;
    this.orderId = orderId;
    this.orderItems = orderItems;
    this.status = status;
    this.totalAmount = this.calculateTotalAmount();
  }

  private calculateTotalAmount(): number {
    return this.orderItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  }
}
