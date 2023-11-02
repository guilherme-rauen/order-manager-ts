import EventEmitter from 'events';

import { EventTypeMapper } from './mappers';
import { OrderService } from '../../application';
import {
  EventType,
  OrderCancelledEvent,
  PaymentConfirmedEvent,
  PaymentFailedEvent,
  ShipmentDeliveredEvent,
  ShipmentDispatchedEvent,
} from '../../domain/event';
import { IEventHandler, ILogger } from '../../domain/interfaces';

export class EventHandler implements IEventHandler {
  private readonly module = 'EventHandler';

  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: ILogger,
    private readonly mapper: EventTypeMapper,
    private readonly orderService: OrderService,
  ) {
    this.registerListeners();
    this.logger.debug('Event listners registered', { module: this.module });
  }

  private registerListeners(): void {
    this.eventEmitter.on(EventType.CANCELLED, this.handleOrderCancelled.bind(this));
    this.eventEmitter.on(EventType.CONFIRMED, this.handleOrderConfirmed.bind(this));
    this.eventEmitter.on(EventType.DELIVERED, this.handleOrderDelivered.bind(this));
    this.eventEmitter.on(EventType.SHIPPED, this.handleOrderShipped.bind(this));

    return;
  }

  public emitEvent(
    data:
      | OrderCancelledEvent
      | PaymentConfirmedEvent
      | PaymentFailedEvent
      | ShipmentDeliveredEvent
      | ShipmentDispatchedEvent,
  ): void {
    const event = this.mapper.mapToEvent(data);
    this.eventEmitter.emit(event, data);

    this.logger.debug(`${event} Event Emitted`, {
      module: this.module,
      event,
      data,
    });

    return;
  }

  public async handleOrderCancelled(data: OrderCancelledEvent | PaymentFailedEvent): Promise<void> {
    try {
      const { orderId } = data;
      await this.orderService.updateOrderStatus(orderId, EventType.CANCELLED);

      this.logger.debug('Order Cancelled', {
        module: this.module,
        orderId,
      });

      return;
    } catch (error) {
      return;
    }
  }

  public async handleOrderConfirmed(data: PaymentConfirmedEvent): Promise<void> {
    try {
      const { amount, orderId } = data;
      await this.orderService.updateOrderStatus(orderId, EventType.CONFIRMED, amount);

      this.logger.debug('Order Confirmed', {
        module: this.module,
        orderId,
      });

      return;
    } catch (error) {
      return;
    }
  }

  public async handleOrderDelivered(data: ShipmentDeliveredEvent): Promise<void> {
    try {
      const { orderId } = data;
      await this.orderService.updateOrderStatus(orderId, EventType.DELIVERED);

      this.logger.debug('Order Delivered', {
        module: this.module,
        orderId,
      });

      return;
    } catch (error) {
      return;
    }
  }

  public async handleOrderShipped(data: ShipmentDispatchedEvent): Promise<void> {
    try {
      const { orderId } = data;
      await this.orderService.updateOrderStatus(orderId, EventType.SHIPPED);

      this.logger.debug('Order Shipped', {
        module: this.module,
        orderId,
      });

      return;
    } catch (error) {
      return;
    }
  }
}
