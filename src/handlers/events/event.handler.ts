import EventEmitter from 'events';

import { PaymentWebhookDto, ShipmentWebhookDto } from './dtos';
import { EventTypeMapper } from './mappers';
import { Logger } from '../../logger.module';

export class EventHandler {
  private readonly module = 'EventHandler';

  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: Logger,
    private readonly mapper: EventTypeMapper,
  ) {}

  public emitEvent(data: PaymentWebhookDto | ShipmentWebhookDto): void {
    const event = this.mapper.mapToEvent(data);
    this.eventEmitter.emit(event, data);
    this.logger.debug(`${event.toUpperCase()} Event Emitted`, {
      module: this.module,
      event: event.toUpperCase(),
      data,
    });
    return;
  }
}
