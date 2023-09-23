import { Order, OrderStatus } from '../../../domain';
import { IOrder } from '../../../domain/interfaces';

export class OrderMapper {
  private statusToDomain(status: string): OrderStatus {
    return new OrderStatus(status);
  }

  private statusToModel(status: OrderStatus): string {
    return status.toString();
  }

  public mapToDomain(order: IOrder): Order {
    return new Order({
      orderId: order.orderId,
      orderDate: order.orderDate,
      orderItems: order.orderItems,
      status: this.statusToDomain(order.status),
      customerId: order.customerId,
    });
  }

  public mapToModel(order: Order): IOrder {
    return {
      orderId: order.orderId,
      orderDate: order.orderDate,
      orderItems: order.orderItems,
      totalAmount: order.totalAmount,
      status: this.statusToModel(order.status),
      customerId: order.customerId,
    };
  }
}
