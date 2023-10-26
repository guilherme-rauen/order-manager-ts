import {
  OrderCancelledEvent,
  PaymentConfirmedEvent,
  PaymentFailedEvent,
  ShipmentDeliveredEvent,
  ShipmentDispatchedEvent,
} from '../../../../../src/domain/event';
import { Order, OrderStatus } from '../../../../../src/domain/order';
import { EventTypeMapper } from '../../../../../src/handlers/events/mappers';

describe('EventTypeMapper', () => {
  const mapper = new EventTypeMapper();

  it('should map to cancelled event when data is instanceof OrderCancelledEvent', () => {
    const data = new OrderCancelledEvent({
      orderId: 'order-id',
    });

    const result = mapper.mapToEvent(data);
    expect(result).toBe('CANCELLED');
  });

  it('should map to confirmed event when data is instanceof PaymentConfirmedEvent', () => {
    const data = new PaymentConfirmedEvent({
      amount: 100,
      orderId: 'order-id',
      provider: 'provider',
      transactionId: 'transaction-id',
    });

    const result = mapper.mapToEvent(data);
    expect(result).toBe('CONFIRMED');
  });

  it('should map to cancelled event when data is instanceof PaymentFailedEvent', () => {
    const data = new PaymentFailedEvent({
      amount: 100,
      orderId: 'order-id',
      provider: 'provider',
      transactionId: 'transaction-id',
    });

    const result = mapper.mapToEvent(data);
    expect(result).toBe('CANCELLED');
  });

  it('should map to shipped event when data is instanceof ShipmentDispatchedEvent', () => {
    const data = new ShipmentDispatchedEvent({
      carrier: 'carrier',
      orderId: 'order-id',
      trackingCode: 'tracking-code',
    });

    const result = mapper.mapToEvent(data);
    expect(result).toBe('SHIPPED');
  });

  it('should map to delivered event when data is instanceof ShipmentDeliveredEvent', () => {
    const data = new ShipmentDeliveredEvent({
      carrier: 'carrier',
      orderId: 'order-id',
      trackingCode: 'tracking-code',
    });

    const result = mapper.mapToEvent(data);
    expect(result).toBe('DELIVERED');
  });

  it('should throw error when the event type is an invalid one', () => {
    const data = new Order({
      customerId: 'customer-id',
      orderDate: new Date(),
      orderItems: [],
      status: new OrderStatus('pending'),
      orderId: 'order-id',
    });

    expect(() => mapper.mapToEvent(data)).toThrow(
      `Event type not found for: ${data.constructor.name}`,
    );
  });
});
