import { EventType } from '../../../domain/event';
import { CancelOrderDto, PaymentWebhookDto, ShipmentWebhookDto } from '../dtos';

export class EventTypeMapper {
  public mapToEvent(data: CancelOrderDto | PaymentWebhookDto | ShipmentWebhookDto): string {
    const { endpoint } = data;

    switch (endpoint) {
      case 'cancel':
        return EventType.CANCELLED;

      case 'payment': {
        const { status } = data;

        if (status === 'approved') {
          return EventType.CONFIRMED;
        }

        if (status === 'declined' || status === 'failed') {
          return EventType.CANCELLED;
        }

        throw new Error(`Invalid status: ${status}`);
      }

      case 'shipment': {
        const { status } = data;

        if (status === 'shipped') {
          return EventType.SHIPPED;
        }

        if (status === 'delivered') {
          return EventType.DELIVERED;
        }

        throw new Error(`Invalid status: ${status}`);
      }

      default:
        throw new Error(`Invalid endpoint: ${endpoint}`);
    }
  }
}
