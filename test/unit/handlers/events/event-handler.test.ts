import EventEmitter from 'events';

import { EventHandler } from '../../../../src/handlers/events';
import { EventTypeMapper } from '../../../../src/handlers/events/mappers';
import { Logger } from '../../../../src/logger.module';

describe('EventHandler', () => {
  let eventHandler: EventHandler;
  let eventEmitter: EventEmitter;
  let mapper: EventTypeMapper;

  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  };

  const loggerDebugSpy = jest.spyOn(logger, 'debug');

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
    eventHandler = new EventHandler(eventEmitter, logger as unknown as Logger, mapper);
  });

  afterEach(() => {
    jest.resetAllMocks();
    eventEmitter.removeAllListeners();
  });

  describe('emitEvent', () => {
    it('should emit an order confirmed event and log a debug message', () => {
      const eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');

      eventHandler.emitEvent(paymentDto);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith('confirmed', paymentDto);
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
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith('cancelled', data);
      expect(loggerDebugSpy).toHaveBeenCalledWith('CANCELLED Event Emitted', {
        module: 'EventHandler',
        event: 'CANCELLED',
        data,
      });
    });

    it('should emit an order shipped event and log a debug message', () => {
      const eventEmitterEmitSpy = jest.spyOn(eventEmitter, 'emit');

      eventHandler.emitEvent(shipmentDto);
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith('shipped', shipmentDto);
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
      expect(eventEmitterEmitSpy).toHaveBeenCalledWith('delivered', data);
      expect(loggerDebugSpy).toHaveBeenCalledWith('DELIVERED Event Emitted', {
        module: 'EventHandler',
        event: 'DELIVERED',
        data,
      });
    });
  });
});
