import {
  EventType,
  OrderCancelledEvent,
  PaymentConfirmedEvent,
  PaymentFailedEvent,
  ShipmentDeliveredEvent,
  ShipmentDispatchedEvent,
} from '../../../domain/event';

export class EventTypeMapper {
  public mapToEvent(
    data:
      | OrderCancelledEvent
      | PaymentConfirmedEvent
      | PaymentFailedEvent
      | ShipmentDeliveredEvent
      | ShipmentDispatchedEvent,
  ): string {
    switch (true) {
      case data instanceof PaymentConfirmedEvent:
        return EventType.CONFIRMED;

      case data instanceof OrderCancelledEvent:
      case data instanceof PaymentFailedEvent:
        return EventType.CANCELLED;

      case data instanceof ShipmentDeliveredEvent:
        return EventType.DELIVERED;

      case data instanceof ShipmentDispatchedEvent:
        return EventType.SHIPPED;

      default:
        throw new Error('Event type not found');
    }
  }
}
