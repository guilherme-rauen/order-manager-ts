import { ShipmentMapper } from '../../../../../src/handlers/controllers/v1/mappers';
import { ShipmentWebhookDto } from '../../../../../src/handlers/controllers/v1/resources/dtos';

describe('ShipmentMapper', () => {
  const mapper = new ShipmentMapper();

  it('should map a shipment webhook dto to shipment delivered event', () => {
    const data: ShipmentWebhookDto = {
      carrier: 'carrier',
      orderId: 'order-id',
      status: 'delivered',
      trackingCode: 'tracking-code',
    };

    const result = mapper.mapToEvent(data);
    expect(result).toEqual({
      carrier: 'carrier',
      orderId: 'order-id',
      trackingCode: 'tracking-code',
    });
  });

  it('should map a shipment webhook dto to shipment dispatched event', () => {
    const data: ShipmentWebhookDto = {
      carrier: 'carrier',
      orderId: 'order-id',
      status: 'shipped',
      trackingCode: 'tracking-code',
    };

    const result = mapper.mapToEvent(data);
    expect(result).toEqual({
      carrier: 'carrier',
      orderId: 'order-id',
      trackingCode: 'tracking-code',
    });
  });

  it('should throw an error when the status is unknown', () => {
    const data: ShipmentWebhookDto = {
      carrier: 'carrier',
      orderId: 'order-id',
      status: 'in transit',
      trackingCode: 'tracking-code',
    };

    expect(() => mapper.mapToEvent(data)).toThrow('Unknown status: in transit');
  });
});
