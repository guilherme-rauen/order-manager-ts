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
  ) {}

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

  public async handleOrderCancelled(orderId: string): Promise<void> {
    await this.orderService.updateOrderStatus(orderId, Event.CANCELLED);

    this.logger.debug('Order Cancelled', {
      module: this.module,
      orderId,
    });

    return;
  }

  public async handleOrderConfirmed(orderId: string): Promise<void> {
    await this.orderService.updateOrderStatus(orderId, Event.CONFIRMED);

    this.logger.debug('Order Confirmed', {
      module: this.module,
      orderId,
    });

    return;
  }

  public async handleOrderDelivered(orderId: string): Promise<void> {
    await this.orderService.updateOrderStatus(orderId, Event.DELIVERED);

    this.logger.debug('Order Delivered', {
      module: this.module,
      orderId,
    });

    return;
  }

  public async handleOrderShipped(orderId: string): Promise<void> {
    await this.orderService.updateOrderStatus(orderId, Event.SHIPPED);

    this.logger.debug('Order Shipped', {
      module: this.module,
      orderId,
    });

    return;
  }
}
