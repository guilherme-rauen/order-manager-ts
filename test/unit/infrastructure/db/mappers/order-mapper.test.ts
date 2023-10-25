import { IOrder } from '../../../../../src/domain/interfaces';
import { Order, OrderItem, OrderStatus } from '../../../../../src/domain/order';
import { OrderMapper } from '../../../../../src/infrastructure/db/mappers';

describe('OrderMapper', () => {
  const mapper = new OrderMapper();

  it('should map order domain to order model', () => {
    const queryResult: IOrder = {
      customerId: 'customer-id',
      orderId: 'order-id',
      orderDate: new Date(),
      orderItems: [
        {
          productId: 'product-id',
          quantity: 1,
          unitPrice: 10.0,
        },
      ],
      totalAmount: 10.0,
      status: 'PENDING',
    };

    const order = mapper.mapToDomain(queryResult);
    expect(order.customerId).toBe(queryResult.customerId);
    expect(order.orderId).toBe(queryResult.orderId);
    expect(order.orderDate).toBe(queryResult.orderDate);
    expect(order.orderItems).toBe(queryResult.orderItems);
    expect(order.status).toEqual(new OrderStatus(queryResult.status));
    expect(order.totalAmount).toBe(queryResult.totalAmount);
  });

  it('should map order model to order domain', () => {
    const date = new Date();
    const orderItem = new OrderItem({ productId: 'product-id', quantity: 1, unitPrice: 10.0 });
    const order = new Order({
      customerId: 'customer-id',
      orderId: 'order-id',
      orderDate: date,
      orderItems: [orderItem],
      status: new OrderStatus('PENDING'),
    });

    const model = mapper.mapToModel(order);
    expect(model.customerId).toBe(order.customerId);
    expect(model.orderId).toBe(order.orderId);
    expect(model.orderDate).toBe(order.orderDate);
    expect(model.orderItems).toBe(order.orderItems);
    expect(model.status).toBe(order.status.toString());
    expect(model.totalAmount).toBe(order.totalAmount);
  });
});
