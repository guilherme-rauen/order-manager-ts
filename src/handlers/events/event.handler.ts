import EventEmitter from 'events';

import { PaymentWebhookDto, ShipmentWebhookDto } from './dtos';
import { EventTypeMapper } from './mappers';
import { OrderService } from '../../application';
import { Event } from '../../domain';
import { Logger } from '../../logger.module';

export class EventHandler {
  private readonly module = 'EventHandler';

  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: Logger,
    private readonly mapper: EventTypeMapper,
    private readonly orderService: OrderService,
  ) {
    this.registerListeners();
    this.logger.debug('Event listners registered', { module: this.module });
  }

  private registerListeners(): void {
    this.eventEmitter.on(Event.CANCELLED, this.handleOrderCancelled.bind(this));
    this.eventEmitter.on(Event.CONFIRMED, this.handleOrderConfirmed.bind(this));
    this.eventEmitter.on(Event.DELIVERED, this.handleOrderDelivered.bind(this));
    this.eventEmitter.on(Event.SHIPPED, this.handleOrderShipped.bind(this));

    return;
  }

  public emitEvent(data: PaymentWebhookDto | ShipmentWebhookDto): void {
    const event = this.mapper.mapToEvent(data);
    this.eventEmitter.emit(event, data);

    this.logger.debug(`${event} Event Emitted`, {
      module: this.module,
      event,
      data,
    });

    return;
  }

  public async handleOrderCancelled(data: PaymentWebhookDto): Promise<void> {
    try {
      const { orderId } = data;
      await this.orderService.updateOrderStatus(orderId, Event.CANCELLED);

      this.logger.debug('Order Cancelled', {
        module: this.module,
        orderId,
      });

      return;
    } catch (error) {
      return;
    }
  }

  public async handleOrderConfirmed(data: PaymentWebhookDto): Promise<void> {
    try {
      const { amount, orderId } = data;
      await this.orderService.updateOrderStatus(orderId, Event.CONFIRMED, amount);

      this.logger.debug('Order Confirmed', {
        module: this.module,
        orderId,
      });

      return;
    } catch (error) {
      return;
    }
  }

  public async handleOrderDelivered(data: ShipmentWebhookDto): Promise<void> {
    try {
      const { orderId } = data;
      await this.orderService.updateOrderStatus(orderId, Event.DELIVERED);

      this.logger.debug('Order Delivered', {
        module: this.module,
        orderId,
      });

      return;
    } catch (error) {
      return;
    }
  }

  public async handleOrderShipped(data: ShipmentWebhookDto): Promise<void> {
    try {
      const { orderId } = data;
      await this.orderService.updateOrderStatus(orderId, Event.SHIPPED);

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
