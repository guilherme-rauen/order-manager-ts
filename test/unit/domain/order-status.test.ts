import { OrderStatus } from '../../../src/domain';

describe('OrderStatus', () => {
  const status = 'shipped';
  const orderStatus = new OrderStatus(status);

  it('should return the status', () => {
    const result = orderStatus.getOrderStatus();
    expect(result).toBe(status.toUpperCase());
  });

  it('should throw an error if the status is invalid', () => {
    const status = 'invalid';
    expect(() => new OrderStatus(status)).toThrow();
  });

  it('should return the status as string', () => {
    const result = orderStatus.toString();
    expect(result).toBe(status.toUpperCase());
  });
});
