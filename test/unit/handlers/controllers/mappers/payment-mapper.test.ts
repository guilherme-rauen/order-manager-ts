import { PaymentMapper } from '../../../../../src/handlers/controllers/v1/mappers';
import { PaymentWebhookDto } from '../../../../../src/handlers/controllers/v1/resources/dtos';

describe('PaymentMapper', () => {
  const mapper = new PaymentMapper();

  it('should map a payment webhook dto to payment confirmed event', () => {
    const data: PaymentWebhookDto = {
      amount: 100,
      orderId: 'order-id',
      provider: 'provider',
      status: 'approved',
      transactionId: 'transaction-id',
    };

    const result = mapper.mapToEvent(data);
    expect(result).toEqual({
      amount: 100,
      orderId: 'order-id',
      provider: 'provider',
      transactionId: 'transaction-id',
    });
  });

  it.each(['declined', 'failed'])(
    'should map a payment webhook dto to payment failed event - status: %p',
    status => {
      const data: PaymentWebhookDto = {
        amount: 100,
        orderId: 'order-id',
        provider: 'provider',
        status,
        transactionId: 'transaction-id',
      };

      const result = mapper.mapToEvent(data);
      expect(result).toEqual({
        amount: 100,
        orderId: 'order-id',
        provider: 'provider',
        transactionId: 'transaction-id',
      });
    },
  );

  it('should throw an error when the status is unknown', () => {
    const data: PaymentWebhookDto = {
      amount: 100,
      orderId: 'order-id',
      provider: 'provider',
      status: 'success',
      transactionId: 'transaction-id',
    };

    expect(() => mapper.mapToEvent(data)).toThrow('Unknown status: success');
  });
});
