import { InvalidOrderStatusException } from '../../../src/domain/exceptions';
import { OrderStatus } from '../../../src/domain/order';

describe('OrderStatus', () => {
  const status = 'shipped';
  const orderStatus = new OrderStatus(status);

  describe('constructor', () => {
    it('should throw an error if the status is invalid', () => {
      const status = 'invalid';
      expect(() => new OrderStatus(status)).toThrow();
    });

    it('should return the status as string', () => {
      const result = orderStatus.toString();
      expect(result).toBe(status.toUpperCase());
    });
  });

  describe('setStatus', () => {
    it('should set the status for a valid transition', () => {
      const orderStatus = new OrderStatus('PENDING');
      orderStatus.setStatus('CONFIRMED');
      expect(orderStatus).toEqual(new OrderStatus('confirmed'));
    });

    it('should throw an error for an invalid transition', () => {
      const orderStatus = new OrderStatus('pending');
      expect(() => orderStatus.setStatus('delivered')).toThrow(InvalidOrderStatusException);
    });
  });
});
