import { PaymentConfirmedEvent, PaymentFailedEvent } from '../../../../domain/event';
import { PaymentWebhookDto } from '../resources/dtos';

export class PaymentMapper {
  public mapToEvent(dto: PaymentWebhookDto): PaymentConfirmedEvent | PaymentFailedEvent {
    switch (dto.status) {
      case 'approved':
        return new PaymentConfirmedEvent({
          amount: dto.amount,
          orderId: dto.orderId,
          provider: dto.provider,
          transactionId: dto.transactionId,
        });

      case 'declined':
      case 'failed':
        return new PaymentFailedEvent({
          amount: dto.amount,
          orderId: dto.orderId,
          provider: dto.provider,
          transactionId: dto.transactionId,
        });

      default:
        throw new Error(`Unknown status: ${dto.status}`);
    }
  }
}
