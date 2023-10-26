import { ShipmentDeliveredEvent, ShipmentDispatchedEvent } from '../../../../domain/event';
import { ShipmentWebhookDto } from '../resources/dtos';

export class ShipmentMapper {
  public mapToEvent(dto: ShipmentWebhookDto): ShipmentDeliveredEvent | ShipmentDispatchedEvent {
    switch (dto.status) {
      case 'delivered':
        return new ShipmentDeliveredEvent({
          orderId: dto.orderId,
          carrier: dto.carrier,
          trackingCode: dto.trackingCode,
        });

      case 'shipped':
        return new ShipmentDispatchedEvent({
          orderId: dto.orderId,
          carrier: dto.carrier,
          trackingCode: dto.trackingCode,
        });

      default:
        throw new Error(`Unknown status: ${dto.status}`);
    }
  }
}
