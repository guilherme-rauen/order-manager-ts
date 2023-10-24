import {
  CancelOrderDto,
  PaymentWebhookDto,
  ShipmentWebhookDto,
} from '../../../../../src/handlers/events/dtos';
import { EventTypeMapper } from '../../../../../src/handlers/events/mappers';

describe('EventTypeMapper', () => {
  const mapper = new EventTypeMapper();

  it('should map to cancelled event', () => {
    const data: CancelOrderDto = {
      date: new Date(),
      endpoint: 'cancel',
      orderId: 'order-id',
      status: 'cancelled',
    };

    const result = mapper.mapToEvent(data);
    expect(result).toBe('CANCELLED');
  });

  it('should map to confirmed event', () => {
    const data: PaymentWebhookDto = {
      amount: 100,
      endpoint: 'payment',
      orderId: 'order-id',
      provider: 'provider',
      status: 'approved',
      transactionId: 'transaction-id',
    };

    const result = mapper.mapToEvent(data);
    expect(result).toBe('CONFIRMED');
  });

  it.each(['denied', 'failed'])('should map to cancelled event when payment - %p', status => {
    const data: PaymentWebhookDto = {
      amount: 100,
      endpoint: 'payment',
      orderId: 'order-id',
      provider: 'provider',
      status,
      transactionId: 'transaction-id',
    };

    const result = mapper.mapToEvent(data);
    expect(result).toBe('CANCELLED');
  });

  it('should throw error when payment status is invalid', () => {
    const data: PaymentWebhookDto = {
      amount: 100,
      endpoint: 'payment',
      orderId: 'order-id',
      provider: 'provider',
      status: 'invalid-status',
      transactionId: 'transaction-id',
    };

    expect(() => mapper.mapToEvent(data)).toThrow('Invalid status: invalid-status');
  });

  it('should map to shipped event', () => {
    const data: ShipmentWebhookDto = {
      carrier: 'carrier',
      endpoint: 'shipment',
      orderId: 'order-id',
      status: 'shipped',
      trackingCode: 'tracking-code',
    };

    const result = mapper.mapToEvent(data);
    expect(result).toBe('SHIPPED');
  });

  it('should map to delivered event', () => {
    const data: ShipmentWebhookDto = {
      carrier: 'carrier',
      endpoint: 'shipment',
      orderId: 'order-id',
      status: 'delivered',
      trackingCode: 'tracking-code',
    };

    const result = mapper.mapToEvent(data);
    expect(result).toBe('DELIVERED');
  });

  it('should throw error when shipment status is invalid', () => {
    const data: ShipmentWebhookDto = {
      carrier: 'carrier',
      endpoint: 'shipment',
      orderId: 'order-id',
      status: 'invalid-status',
      trackingCode: 'tracking-code',
    };

    expect(() => mapper.mapToEvent(data)).toThrow('Invalid status: invalid-status');
  });

  it('should throw error when endpoint is invalid', () => {
    const data: ShipmentWebhookDto = {
      carrier: 'carrier',
      endpoint: 'invalid-endpoint',
      orderId: 'order-id',
      status: 'shipped',
      trackingCode: 'tracking-code',
    };

    expect(() => mapper.mapToEvent(data)).toThrow('Invalid endpoint: invalid-endpoint');
  });
});
