import { PaymentWebhookDto, ShipmentWebhookDto } from '../dtos';

export class EventTypeMapper {
  public mapToEvent(data: PaymentWebhookDto | ShipmentWebhookDto): string {
    const { endpoint } = data;

    switch (endpoint) {
      case 'payment': {
        const { status } = data;

        if (status === 'approved') {
          return 'confirmed';
        }

        if (status === 'denied' || status === 'failed') {
          return 'cancelled';
        }

        throw new Error(`Invalid status: ${status}`);
      }

      case 'shipment': {
        const { status } = data;

        if (status === 'shipped') {
          return 'shipped';
        }

        if (status === 'delivered') {
          return 'delivered';
        }

        throw new Error(`Invalid status: ${status}`);
      }

      default:
        throw new Error(`Invalid endpoint: ${endpoint}`);
    }
  }
}
