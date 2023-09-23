import { OrderService } from '../../../src/application';
import { Order, OrderStatus } from '../../../src/domain';
import { ObjectNotFoundException } from '../../../src/domain/exceptions';
import { OrderRepository } from '../../../src/infrastructure/db/repositories';
import { Logger } from '../../../src/logger.module';

describe('OrderService', () => {
  const logger = {
    debug: jest.fn(),
  } as unknown as Logger;

  const repository = {
    getOrderById: jest.fn(),
    getOrdersByCustomerId: jest.fn(),
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

  describe('upsertOrder', () => {
    it('should upsert an order', async () => {
      const newStatus = new OrderStatus('delivered');
      repository.store = jest.fn().mockResolvedValueOnce({ ...order, status: newStatus });

      const result = await service.upsertOrder(order);
      expect(repository.store).toHaveBeenCalledWith(order);
      expect(result.customerId).toBe(order.customerId);
      expect(result.orderDate).toBe(order.orderDate);
      expect(result.orderId).toBe(order.orderId);
      expect(result.orderItems).toBe(order.orderItems);
      expect(result.status).toBe(newStatus);
      expect(result.totalAmount).toBe(130.25);
    });

    it('should throw if an error occurs', async () => {
      repository.store = jest.fn().mockRejectedValueOnce(new Error('Internal Server Error'));
      await expect(service.upsertOrder(order)).rejects.toThrow('Internal Server Error');
    });
  });
});
