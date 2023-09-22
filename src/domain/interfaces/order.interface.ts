import { IOrderItem } from './order-item.interface';

export interface IOrder {
  customerId: string;
  orderDate: Date;
  orderId: string;
  orderItems: IOrderItem[];
  status: string;
  totalAmount: number;
}
