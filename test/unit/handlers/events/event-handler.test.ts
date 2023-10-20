import EventEmitter from 'events';

import { OrderService } from '../../../../src/application';
import { Event, Order } from '../../../../src/domain';
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

  const paymentDto = {
    amount: 100,
    endpoint: 'payment',
    orderId: 'order-id',
    provider: 'provider',
    status: 'approved',
    transactionId: 'transaction-id',
  };

  const shipmentDto = {
    carrier: 'carrier',
    endpoint: 'shipment',
    orderId: 'order-id',
    status: 'shipped',
    trackingCode: 'tracking-code',
  };

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

      eventHandler.emitEvent(paymentDto);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith(Event.CONFIRMED, paymentDto);
      expect(loggerDebugSpy).toHaveBeenCalledWith('CONFIRMED Event Emitted', {
        module: 'EventHandler',
        event: 'CONFIRMED',
        data: paymentDto,
      });
    });

    it('should emit an order cancelled event and log a debug message', () => {
      const eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');

      const data = { ...paymentDto, status: 'denied' };
      eventHandler.emitEvent(data);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith(Event.CANCELLED, data);
      expect(loggerDebugSpy).toHaveBeenCalledWith('CANCELLED Event Emitted', {
        module: 'EventHandler',
        event: 'CANCELLED',
        data,
      });
    });

    it('should emit an order shipped event and log a debug message', () => {
      const eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');

      eventHandler.emitEvent(shipmentDto);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith(Event.SHIPPED, shipmentDto);
      expect(loggerDebugSpy).toHaveBeenCalledWith('SHIPPED Event Emitted', {
        module: 'EventHandler',
        event: 'SHIPPED',
        data: shipmentDto,
      });
    });

    it('should emit an order delivered event and log a debug message', () => {
      const eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');

      const data = { ...shipmentDto, status: 'delivered' };
      eventHandler.emitEvent(data);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith(Event.DELIVERED, data);
      expect(loggerDebugSpy).toHaveBeenCalledWith('DELIVERED Event Emitted', {
        module: 'EventHandler',
        event: 'DELIVERED',
        data,
      });
    });
  });

  describe('handleOrderCancelled', () => {
    it('should update the order status to cancelled and log a debug message', async () => {
      await eventHandler.handleOrderCancelled(paymentDto.orderId);
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(paymentDto.orderId, Event.CANCELLED);
      expect(loggerDebugSpy).toHaveBeenCalledWith('Order Cancelled', {
        module: 'EventHandler',
        orderId: paymentDto.orderId,
      });
    });
  });

  describe('handleOrderConfirmed', () => {
    it('should update the order status to confirmed and log a debug message', async () => {
      await eventHandler.handleOrderConfirmed(paymentDto.orderId);
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(paymentDto.orderId, Event.CONFIRMED);
      expect(loggerDebugSpy).toHaveBeenCalledWith('Order Confirmed', {
        module: 'EventHandler',
        orderId: paymentDto.orderId,
      });
    });
  });

  describe('handleOrderDelivered', () => {
    it('should update the order status to delivered and log a debug message', async () => {
      await eventHandler.handleOrderDelivered(shipmentDto.orderId);
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(shipmentDto.orderId, Event.DELIVERED);
      expect(loggerDebugSpy).toHaveBeenCalledWith('Order Delivered', {
        module: 'EventHandler',
        orderId: shipmentDto.orderId,
      });
    });
  });

  describe('handleOrderShipped', () => {
    it('should update the order status to shipped and log a debug message', async () => {
      await eventHandler.handleOrderShipped(shipmentDto.orderId);
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(shipmentDto.orderId, Event.SHIPPED);
      expect(loggerDebugSpy).toHaveBeenCalledWith('Order Shipped', {
        module: 'EventHandler',
        orderId: shipmentDto.orderId,
      });
    });
  });
});
