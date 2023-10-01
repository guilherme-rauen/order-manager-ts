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
    orderId?: string;
    orderDate: Date;
    orderItems: OrderItem[];
    status: OrderStatus;
    customerId: string;
  }) {
    this.customerId = customerId;
    this.orderDate = orderDate;
    this.orderId = orderId ?? this.createOrderId();
    this.orderItems = orderItems;
    this.status = status;
    this.totalAmount = this.calculateTotalAmount();
  }

  private calculateTotalAmount(): number {
    return this.orderItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  }

  public createOrderId(): string {
    const prefix = process.env.ORDER_PREFIX || 'ORD';
    const year = new Date().getFullYear().toString().slice(2);
    const timestamp = new Date().getTime().toString().slice(8);
    const unique = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${year}-${unique}${timestamp}`;
  }

  public static validateOrderId(orderId: string): boolean {
    const prefix = process.env.ORDER_PREFIX || 'ORD';
    const validation = new RegExp(/^-\d{2}-[A-Z0-9]{5}\d{5}$/gm);
    return validation.test(orderId.replace(prefix, ''));
  }
}
