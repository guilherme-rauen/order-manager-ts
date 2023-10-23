import { Order } from '../order';
import { OrderStatus } from '../order-status';

export interface IOrderRepository {
  getAllOrders(): Promise<Order[]>;
  getOrdersByCustomerId(customerId: string): Promise<Order[]>;
  getOrderById(orderId: string): Promise<Order>;
  getOrdersByStatus(status: OrderStatus): Promise<Order[]>;
  remove(orderId: string): Promise<void>;
  store(order: Order, controllerOrigin?: boolean): Promise<Order>;
}
