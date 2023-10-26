export interface ShipmentWebhookDto {
  carrier: string;
  orderId: string;
  status: string;
  trackingCode: string;
}
