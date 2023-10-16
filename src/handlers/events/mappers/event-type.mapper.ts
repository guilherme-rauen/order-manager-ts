import { Event } from '../../../domain';
import { PaymentWebhookDto, ShipmentWebhookDto } from '../dtos';

export class EventTypeMapper {
  public mapToEvent(data: PaymentWebhookDto | ShipmentWebhookDto): string {
    const { endpoint } = data;

    switch (endpoint) {
      case 'payment': {
        const { status } = data;

        if (status === 'approved') {
          return Event.CONFIRMED;
        }

        if (status === 'denied' || status === 'failed') {
          return Event.CANCELLED;
        }

        throw new Error(`Invalid status: ${status}`);
      }

      case 'shipment': {
        const { status } = data;

        if (status === 'shipped') {
          return Event.SHIPPED;
        }

        if (status === 'delivered') {
          return Event.DELIVERED;
        }

        throw new Error(`Invalid status: ${status}`);
      }

      default:
        throw new Error(`Invalid endpoint: ${endpoint}`);
    }
  }
}
