import { OrderService } from '../../../src/application';
import { Event, Order, OrderStatus } from '../../../src/domain';
import { AmountMismatchException, ObjectNotFoundException } from '../../../src/domain/exceptions';
import { OrderRepository } from '../../../src/infrastructure/db/repositories';
import { Logger } from '../../../src/logger.module';

describe('OrderService', () => {
  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  } as unknown as Logger;

  const repository = {
    getOrderById: jest.fn(),
    getOrdersByCustomerId: jest.fn(),
    getOrdersByStatus: jest.fn(),
    getAllOrders: jest.fn(),
    store: jest.fn(),
  } as unknown as OrderRepository;

  const order = new Order({
    customerId: 'customer-id',
    orderId: 'order-id',
    orderDate: new Date(),
    orderItems: [
      {
        productId: 'product-id-1',
        quantity: 1,
        unitPrice: 100.25,
      },
      {
        productId: 'product-id-2',
        quantity: 1,
        unitPrice: 30,
      },
    ],
    status: new OrderStatus('shipped'),
  });

  const service = new OrderService(logger, repository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderDetails', () => {
    it('should get the order details', async () => {
      repository.getOrderById = jest.fn().mockResolvedValueOnce(order);

      const result = await service.getOrderDetails('order-id');
      expect(repository.getOrderById).toHaveBeenCalledWith('order-id');
      expect(result.customerId).toBe(order.customerId);
      expect(result.orderDate).toBe(order.orderDate);
      expect(result.orderId).toBe(order.orderId);
      expect(result.orderItems).toBe(order.orderItems);
      expect(result.status).toBe(order.status);
      expect(result.totalAmount).toBe(130.25);
    });

    it('should throw ObjectNotFoundException if order is not found', async () => {
      repository.getOrderById = jest
        .fn()
        .mockRejectedValueOnce(new ObjectNotFoundException('Order', 'order-id'));
      await expect(service.getOrderDetails('order-id')).rejects.toThrow(ObjectNotFoundException);
    });

    it('should throw if an error occurs', async () => {
      repository.getOrderById = jest.fn().mockRejectedValueOnce(new Error('Internal Server Error'));
      await expect(service.getOrderDetails('order-id')).rejects.toThrow('Internal Server Error');
    });
  });

  describe('listCustomerOrders', () => {
    it('should return a list of all customer orders', async () => {
      repository.getOrdersByCustomerId = jest.fn().mockResolvedValueOnce([order]);

      const result = await service.listCustomerOrders('customer-id');
      expect(repository.getOrdersByCustomerId).toHaveBeenCalledWith('customer-id');
      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe(order.customerId);
      expect(result[0].orderDate).toBe(order.orderDate);
      expect(result[0].orderId).toBe(order.orderId);
      expect(result[0].orderItems).toBe(order.orderItems);
      expect(result[0].status).toBe(order.status);
      expect(result[0].totalAmount).toBe(130.25);
    });

    it('should return an empty array if no orders exist', async () => {
      repository.getOrdersByCustomerId = jest.fn().mockResolvedValueOnce([]);

      const result = await service.listCustomerOrders('customer-id');
      expect(repository.getOrdersByCustomerId).toHaveBeenCalledWith('customer-id');
      expect(result).toHaveLength(0);
    });

    it('should throw if an error occurs', async () => {
      repository.getOrdersByCustomerId = jest
        .fn()
        .mockRejectedValueOnce(new Error('Internal Server Error'));

      await expect(service.listCustomerOrders('customer-id')).rejects.toThrow(
        'Internal Server Error',
      );
    });
  });

  describe('listOrders', () => {
    it('should return a list of all orders', async () => {
      repository.getAllOrders = jest.fn().mockResolvedValueOnce([order]);

      const result = await service.listOrders();
      expect(repository.getAllOrders).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe(order.customerId);
      expect(result[0].orderDate).toBe(order.orderDate);
      expect(result[0].orderId).toBe(order.orderId);
      expect(result[0].orderItems).toBe(order.orderItems);
      expect(result[0].status).toBe(order.status);
      expect(result[0].totalAmount).toBe(130.25);
    });

    it('should return an empty array if no orders exist', async () => {
      repository.getAllOrders = jest.fn().mockResolvedValueOnce([]);

      const result = await service.listOrders();
      expect(repository.getAllOrders).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it('should throw if an error occurs', async () => {
      repository.getAllOrders = jest.fn().mockRejectedValueOnce(new Error('Internal Server Error'));
      await expect(service.listOrders()).rejects.toThrow('Internal Server Error');
    });
  });

  describe('listOrdersByStatus', () => {
    it('should return a list of all orders with the given status', async () => {
      repository.getOrdersByStatus = jest.fn().mockResolvedValueOnce([order]);

      const status = new OrderStatus('shipped');
      const result = await service.listOrdersByStatus(status);
      expect(repository.getOrdersByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe(order.customerId);
      expect(result[0].orderDate).toBe(order.orderDate);
      expect(result[0].orderId).toBe(order.orderId);
      expect(result[0].orderItems).toBe(order.orderItems);
      expect(result[0].status).toBe(order.status);
      expect(result[0].totalAmount).toBe(130.25);
    });

    it('should return an empty array if no orders exist', async () => {
      repository.getOrdersByStatus = jest.fn().mockResolvedValueOnce([]);

      const status = new OrderStatus('pending');
      const result = await service.listOrdersByStatus(status);
      expect(repository.getOrdersByStatus).toHaveBeenCalledWith(status);
      expect(result).toHaveLength(0);
    });

    it('should throw if an error occurs', async () => {
      repository.getOrdersByStatus = jest
        .fn()
        .mockRejectedValueOnce(new Error('Internal Server Error'));

      await expect(service.listOrdersByStatus(new OrderStatus('shipped'))).rejects.toThrow(
        'Internal Server Error',
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the order status', async () => {
      const newStatus = new OrderStatus('delivered');
      repository.getOrderById = jest.fn().mockResolvedValueOnce(order);
      repository.store = jest.fn().mockResolvedValueOnce({
        ...order,
        status: newStatus,
      });

      const result = await service.updateOrderStatus('order-id', Event.DELIVERED);
      expect(repository.getOrderById).toHaveBeenCalledWith('order-id');
      expect(result.customerId).toBe(order.customerId);
      expect(result.orderDate).toBe(order.orderDate);
      expect(result.orderId).toBe(order.orderId);
      expect(result.orderItems).toBe(order.orderItems);
      expect(result.status).toEqual(newStatus);
      expect(result.totalAmount).toBe(130.25);
    });

    it.each([
      ['less', 130.23, 0.02],
      ['more', 130.27, -0.02],
    ])(
      'should update the order status and log warn the amount mismatch to %p',
      async (_, value, difference) => {
        const spy = jest.spyOn(logger, 'warn');
        const newStatus = new OrderStatus('confirmed');
        repository.getOrderById = jest
          .fn()
          .mockResolvedValueOnce({ ...order, status: new OrderStatus('pending') });
        repository.store = jest.fn().mockResolvedValueOnce({
          ...order,
          status: newStatus,
        });

        const result = await service.updateOrderStatus('order-id', Event.CONFIRMED, value);
        expect(repository.getOrderById).toHaveBeenCalledWith('order-id');
        expect(result.customerId).toBe(order.customerId);
        expect(result.orderDate).toBe(order.orderDate);
        expect(result.orderId).toBe(order.orderId);
        expect(result.orderItems).toBe(order.orderItems);
        expect(result.status).toEqual(newStatus);
        expect(result.totalAmount).toBe(130.25);
        expect(spy).toHaveBeenCalledWith(
          `Paid amount has a difference with the order total amount of ${difference}`,
          { module: 'OrderService' },
        );
      },
    );

    it('should throw InvalidOrderStatusException if the transition is invalid', async () => {
      const newStatus = 'PENDING';
      repository.getOrderById = jest.fn().mockResolvedValueOnce(order);

      await expect(
        service.updateOrderStatus('order-id', newStatus as unknown as Event),
      ).rejects.toThrow(
        `Invalid status transition from ${order.status.toString()} to ${newStatus}`,
      );
    });

    it('should throw InvalidOrderStatusException if the status is invalid', async () => {
      repository.getOrderById = jest.fn().mockResolvedValueOnce(order);

      await expect(
        service.updateOrderStatus('order-id', 'INVALID' as unknown as Event),
      ).rejects.toThrow('Invalid status: INVALID');
    });

    it('should throw an AmountMismatchException if the status is confirmed and amount paid is less than the total amount', async () => {
      repository.getOrderById = jest
        .fn()
        .mockResolvedValueOnce({ ...order, status: new OrderStatus('pending') });

      await expect(service.updateOrderStatus('order-id', Event.CONFIRMED, 130)).rejects.toThrow(
        AmountMismatchException,
      );
    });

    it('should throw an AmountMismatchException if the status is confirmed and amount paid is not provided', async () => {
      repository.getOrderById = jest
        .fn()
        .mockResolvedValueOnce({ ...order, status: new OrderStatus('pending') });

      await expect(service.updateOrderStatus('order-id', Event.CONFIRMED)).rejects.toThrow(
        AmountMismatchException,
      );
    });

    it('should throw ObjectNotFoundException if order is not found', async () => {
      repository.getOrderById = jest
        .fn()
        .mockRejectedValueOnce(new ObjectNotFoundException('Order', 'order-id'));

      await expect(service.updateOrderStatus('order-id', Event.DELIVERED)).rejects.toThrow(
        ObjectNotFoundException,
      );
    });

    it('should throw if an error occurs', async () => {
      repository.getOrderById = jest.fn().mockRejectedValueOnce(new Error('Internal Server Error'));

      await expect(service.updateOrderStatus('order-id', Event.DELIVERED)).rejects.toThrow(
        'Internal Server Error',
      );
    });
  });

  describe('upsertOrder', () => {
    it.each([true, false, undefined])(
      'should upsert an order - controller origin: %p',
      async value => {
        const newQuanity = 2;
        const newAmount = order.orderItems[0].unitPrice * newQuanity;
        const originController = value ?? false;
        repository.store = jest.fn().mockResolvedValueOnce({
          ...order,
          orderItems: [{ ...order.orderItems[0], quantity: newQuanity }],
          totalAmount: newAmount,
        });

        const result = await service.upsertOrder(order, value);
        expect(repository.store).toHaveBeenCalledWith(order, originController);
        expect(result.customerId).toBe(order.customerId);
        expect(result.orderDate).toBe(order.orderDate);
        expect(result.orderId).toBe(order.orderId);
        expect(result.orderItems).toHaveLength(1);
        expect(result.orderItems[0].productId).toBe(order.orderItems[0].productId);
        expect(result.orderItems[0].quantity).toBe(newQuanity);
        expect(result.orderItems[0].unitPrice).toBe(order.orderItems[0].unitPrice);
        expect(result.status).toBe(order.status);
        expect(result.totalAmount).toBe(newAmount);
      },
    );

    it('should throw if an error occurs', async () => {
      repository.store = jest.fn().mockRejectedValueOnce(new Error('Internal Server Error'));
      await expect(service.upsertOrder(order, true)).rejects.toThrow('Internal Server Error');
    });
  });
});
