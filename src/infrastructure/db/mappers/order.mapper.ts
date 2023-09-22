import { Order } from '../../../domain';
import { IOrder } from '../../../domain/interfaces';

export class OrderMapper {
  public mapToDomain(order: IOrder): Order {
    return new Order({
      orderId: order.orderId,
      orderDate: order.orderDate,
      orderItems: order.orderItems,
      customerId: order.customerId,
    });
  }

  public mapToModel(order: Order): IOrder {
    return {
      orderId: order.orderId,
      orderDate: order.orderDate,
      orderItems: order.orderItems,
      totalAmount: order.totalAmount,
      status: order.status,
      customerId: order.customerId,
    };
  }
}
