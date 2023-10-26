import EventEmitter from 'events';

import { OrderService } from '../../../../src/application';
import {
  EventType,
  OrderCancelledEvent,
  PaymentConfirmedEvent,
  PaymentFailedEvent,
  ShipmentDeliveredEvent,
  ShipmentDispatchedEvent,
} from '../../../../src/domain/event';
import { Order } from '../../../../src/domain/order';
import { EventHandler } from '../../../../src/handlers/events';
import { EventTypeMapper } from '../../../../src/handlers/events/mappers';
import { OrderRepository } from '../../../../src/infrastructure/db/repositories';
import { Logger } from '../../../../src/logger.module';

describe('EventHandler', () => {
  let eventHandler: EventHandler;
  let eventEmitter: EventEmitter;
  let mapper: EventTypeMapper;

  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  } as unknown as Logger;

  const repository = {
    getOrderById: jest.fn(),
    getOrdersByCustomerId: jest.fn(),
    getOrdersByStatus: jest.fn(),
    getAllOrders: jest.fn(),
    store: jest.fn(),
  } as unknown as OrderRepository;

  const service = new OrderService(logger, repository);

  const loggerDebugSpy = jest.spyOn(logger, 'debug');
  const updateOrderStatusSpy = jest.spyOn(service, 'updateOrderStatus');
  updateOrderStatusSpy.mockResolvedValue({} as Order);

  const orderCancelledEvent = new OrderCancelledEvent({
    orderId: 'order-id',
  });

  const paymentConfirmedEvent = new PaymentConfirmedEvent({
    amount: 100,
    orderId: 'order-id',
    provider: 'provider',
    transactionId: 'transaction-id',
  });

  const paymentFailedEvent = new PaymentFailedEvent({
    amount: 100,
    orderId: 'order-id',
    provider: 'provider',
    transactionId: 'transaction-id',
  });

  const shipmentDispatchedEvent = new ShipmentDispatchedEvent({
    carrier: 'carrier',
    orderId: 'order-id',
    trackingCode: 'tracking-code',
  });

  const shipmentDeliveredEvent = new ShipmentDeliveredEvent({
    carrier: 'carrier',
    orderId: 'order-id',
    trackingCode: 'tracking-code',
  });

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    mapper = new EventTypeMapper();
    eventHandler = new EventHandler(eventEmitter, logger, mapper, service);
  });

  afterEach(() => {
    jest.resetAllMocks();
    eventEmitter.removeAllListeners();
  });

  describe('emitEvent', () => {
    it('should emit an order confirmed event and log a debug message', () => {
      const eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');

      eventHandler.emitEvent(paymentConfirmedEvent);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith(EventType.CONFIRMED, paymentConfirmedEvent);
      expect(loggerDebugSpy).toHaveBeenCalledWith('CONFIRMED Event Emitted', {
        module: 'EventHandler',
        event: 'CONFIRMED',
        data: paymentConfirmedEvent,
      });
    });

    it.each([
      ['OrderCancelledEvent', orderCancelledEvent],
      ['PaymentFailedEvent', paymentFailedEvent],
    ])('should emit an order cancelled event and log a debug message - %p', (_, event) => {
      const eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');

      eventHandler.emitEvent(event);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith(EventType.CANCELLED, event);
      expect(loggerDebugSpy).toHaveBeenCalledWith('CANCELLED Event Emitted', {
        module: 'EventHandler',
        event: 'CANCELLED',
        data: event,
      });
    });

    it('should emit an order shipped event and log a debug message', () => {
      const eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');

      eventHandler.emitEvent(shipmentDispatchedEvent);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith(EventType.SHIPPED, shipmentDispatchedEvent);
      expect(loggerDebugSpy).toHaveBeenCalledWith('SHIPPED Event Emitted', {
        module: 'EventHandler',
        event: 'SHIPPED',
        data: shipmentDispatchedEvent,
      });
    });

    it('should emit an order delivered event and log a debug message', () => {
      const eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');

      eventHandler.emitEvent(shipmentDeliveredEvent);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith(EventType.DELIVERED, shipmentDeliveredEvent);
      expect(loggerDebugSpy).toHaveBeenCalledWith('DELIVERED Event Emitted', {
        module: 'EventHandler',
        event: 'DELIVERED',
        data: shipmentDeliveredEvent,
      });
    });
  });

  describe('handleOrderCancelled', () => {
    it.each([
      ['OrderCancelledEvent', orderCancelledEvent],
      ['PaymentFailedEvent', paymentFailedEvent],
    ])(
      'should update the order status to cancelled and log a debug message - %p',
      async (_, event) => {
        await eventHandler.handleOrderCancelled(event);
        expect(updateOrderStatusSpy).toHaveBeenCalledWith(event.orderId, EventType.CANCELLED);
        expect(loggerDebugSpy).toHaveBeenCalledWith('Order Cancelled', {
          module: 'EventHandler',
          orderId: event.orderId,
        });
      },
    );

    it('should return even if an error is thrown during the update', async () => {
      updateOrderStatusSpy.mockRejectedValueOnce(new Error('Failed to update order status'));
      await expect(eventHandler.handleOrderCancelled(orderCancelledEvent)).resolves.not.toThrow();
    });
  });

  describe('handleOrderConfirmed', () => {
    it('should update the order status to confirmed and log a debug message', async () => {
      await eventHandler.handleOrderConfirmed(paymentConfirmedEvent);
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(
        paymentConfirmedEvent.orderId,
        EventType.CONFIRMED,
        paymentConfirmedEvent.amount,
      );
      expect(loggerDebugSpy).toHaveBeenCalledWith('Order Confirmed', {
        module: 'EventHandler',
        orderId: paymentConfirmedEvent.orderId,
      });
    });

    it('should return even if an error is thrown during the update', async () => {
      updateOrderStatusSpy.mockRejectedValueOnce(new Error('Failed to update order status'));
      await expect(eventHandler.handleOrderConfirmed(paymentConfirmedEvent)).resolves.not.toThrow();
    });
  });

  describe('handleOrderDelivered', () => {
    it('should update the order status to delivered and log a debug message', async () => {
      await eventHandler.handleOrderDelivered(shipmentDeliveredEvent);
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(
        shipmentDeliveredEvent.orderId,
        EventType.DELIVERED,
      );
      expect(loggerDebugSpy).toHaveBeenCalledWith('Order Delivered', {
        module: 'EventHandler',
        orderId: shipmentDeliveredEvent.orderId,
      });
    });

    it('should return even if an error is thrown during the update', async () => {
      updateOrderStatusSpy.mockRejectedValueOnce(new Error('Failed to update order status'));
      await expect(
        eventHandler.handleOrderDelivered(shipmentDeliveredEvent),
      ).resolves.not.toThrow();
    });
  });

  describe('handleOrderShipped', () => {
    it('should update the order status to shipped and log a debug message', async () => {
      await eventHandler.handleOrderShipped(shipmentDispatchedEvent);
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(
        shipmentDispatchedEvent.orderId,
        EventType.SHIPPED,
      );
      expect(loggerDebugSpy).toHaveBeenCalledWith('Order Shipped', {
        module: 'EventHandler',
        orderId: shipmentDispatchedEvent.orderId,
      });
    });

    it('should return even if an error is thrown during the update', async () => {
      updateOrderStatusSpy.mockRejectedValueOnce(new Error('Failed to update order status'));
      await expect(eventHandler.handleOrderShipped(shipmentDispatchedEvent)).resolves.not.toThrow();
    });
  });
});
