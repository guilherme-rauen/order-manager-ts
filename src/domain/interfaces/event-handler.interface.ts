import {
  OrderCancelledEvent,
  PaymentConfirmedEvent,
  PaymentFailedEvent,
  ShipmentDeliveredEvent,
  ShipmentDispatchedEvent,
} from '../event';

export interface IEventHandler {
  emitEvent(
    data:
      | OrderCancelledEvent
      | PaymentConfirmedEvent
      | PaymentFailedEvent
      | ShipmentDeliveredEvent
      | ShipmentDispatchedEvent,
  ): void;
  handleOrderCancelled(data: OrderCancelledEvent | PaymentFailedEvent): Promise<void>;
  handleOrderConfirmed(data: PaymentConfirmedEvent): Promise<void>;
  handleOrderDelivered(data: ShipmentDeliveredEvent): Promise<void>;
  handleOrderShipped(data: ShipmentDispatchedEvent): Promise<void>;
}
