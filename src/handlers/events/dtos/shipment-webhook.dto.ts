export interface ShipmentWebhookDto {
  carrier: string;
  endpoint: string;
  orderId: string;
  status: string;
  trackingCode: string;
}
