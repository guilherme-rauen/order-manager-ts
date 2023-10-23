import mongoose from 'mongoose';

import { OrderStatus } from '../../../../../src/domain';
import {
  InvalidOrderStatusException,
  ObjectNotFoundException,
} from '../../../../../src/domain/exceptions';
import { IOrder } from '../../../../../src/domain/interfaces';
import { OrderMapper } from '../../../../../src/infrastructure/db/mappers';
import { OrderRepository } from '../../../../../src/infrastructure/db/repositories';
import { Logger } from '../../../../../src/logger.module';

jest.mock('mongoose');

describe('OrderRepository', () => {
  let repository: OrderRepository;

  const date = new Date();
  const mapper = new OrderMapper();
  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const modelOrder: IOrder = {
    orderId: 'order-id-1',
    orderDate: date,
    orderItems: [
      {
        productId: 'product-id-1',
        quantity: 2,
        unitPrice: 25,
      },
      {
        productId: 'product-id-2',
        quantity: 1,
        unitPrice: 50,
      },
    ],
    totalAmount: 100,
    status: 'PENDING',
    customerId: 'customer-id-1',
  };

  beforeEach(() => {
    mongoose.model = jest.fn().mockReturnValue({
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
    } as unknown);

    repository = new OrderRepository(mongoose, logger, mapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should return an array of domain objects of all orders', async () => {
      (mongoose.model('Order').find as jest.Mock).mockResolvedValueOnce([modelOrder]);

      const result = await repository.getAllOrders();
      expect(mongoose.model('Order').find).toHaveBeenCalledTimes(1);

      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe(modelOrder.customerId);
      expect(result[0].orderDate).toBe(modelOrder.orderDate);
      expect(result[0].orderId).toBe(modelOrder.orderId);
      expect(result[0].orderItems).toBe(modelOrder.orderItems);
      expect(result[0].totalAmount).toBe(modelOrder.totalAmount);
      expect(result[0].status.toString()).toBe(modelOrder.status);
    });

    it('should return an empty array if no orders are found', async () => {
      (mongoose.model('Order').find as jest.Mock).mockResolvedValueOnce([]);

      const result = await repository.getAllOrders();
      expect(mongoose.model('Order').find).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(0);
    });

    it('should throw an error if an error occurs', async () => {
      const error = new Error('error');
      (mongoose.model('Order').find as jest.Mock).mockRejectedValueOnce(error);

      await expect(repository.getAllOrders()).rejects.toThrow(error);
      expect(mongoose.model('Order').find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrderById', () => {
    it('should return a domain object of an order', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockResolvedValueOnce(modelOrder);

      const result = await repository.getOrderById('order-id-1');
      expect(mongoose.model('Order').findOne).toHaveBeenCalledTimes(1);

      expect(result.customerId).toBe(modelOrder.customerId);
      expect(result.orderDate).toBe(modelOrder.orderDate);
      expect(result.orderId).toBe(modelOrder.orderId);
      expect(result.orderItems).toBe(modelOrder.orderItems);
      expect(result.totalAmount).toBe(modelOrder.totalAmount);
      expect(result.status.toString()).toBe(modelOrder.status);
    });

    it('should throw an ObjectNotFoundException if no order is found', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(repository.getOrderById('order-id-1')).rejects.toThrow(ObjectNotFoundException);
      expect(mongoose.model('Order').findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if an error occurs', async () => {
      const error = new Error('error');
      (mongoose.model('Order').findOne as jest.Mock).mockRejectedValueOnce(error);

      await expect(repository.getOrderById('order-id-1')).rejects.toThrow(error);
      expect(mongoose.model('Order').findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrdersByCustomerId', () => {
    it('should return an array of domain objects of orders', async () => {
      (mongoose.model('Order').find as jest.Mock).mockResolvedValueOnce([modelOrder]);

      const result = await repository.getOrdersByCustomerId('customer-id-1');
      expect(mongoose.model('Order').find).toHaveBeenCalledTimes(1);

      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe(modelOrder.customerId);
      expect(result[0].orderDate).toBe(modelOrder.orderDate);
      expect(result[0].orderId).toBe(modelOrder.orderId);
      expect(result[0].orderItems).toBe(modelOrder.orderItems);
      expect(result[0].totalAmount).toBe(modelOrder.totalAmount);
      expect(result[0].status.toString()).toBe(modelOrder.status);
    });

    it('should return an empty array if no orders are found', async () => {
      (mongoose.model('Order').find as jest.Mock).mockResolvedValueOnce([]);

      const result = await repository.getOrdersByCustomerId('customer-id-1');
      expect(mongoose.model('Order').find).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(0);
    });

    it('should throw an error if an error occurs', async () => {
      const error = new Error('error');
      (mongoose.model('Order').find as jest.Mock).mockRejectedValueOnce(error);

      await expect(repository.getOrdersByCustomerId('customer-id-1')).rejects.toThrow(error);
      expect(mongoose.model('Order').find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrdersByStatus', () => {
    it('should return an array of domain objects of orders', async () => {
      (mongoose.model('Order').find as jest.Mock).mockResolvedValueOnce([modelOrder]);

      const status = new OrderStatus('PENDING');
      const result = await repository.getOrdersByStatus(status);
      expect(mongoose.model('Order').find).toHaveBeenCalledTimes(1);

      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe(modelOrder.customerId);
      expect(result[0].orderDate).toBe(modelOrder.orderDate);
      expect(result[0].orderId).toBe(modelOrder.orderId);
      expect(result[0].orderItems).toBe(modelOrder.orderItems);
      expect(result[0].totalAmount).toBe(modelOrder.totalAmount);
      expect(result[0].status.toString()).toBe(modelOrder.status);
    });

    it('should return an empty array if no orders are found', async () => {
      (mongoose.model('Order').find as jest.Mock).mockResolvedValueOnce([]);

      const status = new OrderStatus('PENDING');
      const result = await repository.getOrdersByStatus(status);
      expect(mongoose.model('Order').find).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(0);
    });

    it('should throw an error if an error occurs', async () => {
      const error = new Error('error');
      (mongoose.model('Order').find as jest.Mock).mockRejectedValueOnce(error);

      const status = new OrderStatus('PENDING');
      await expect(repository.getOrdersByStatus(status)).rejects.toThrow(error);
      expect(mongoose.model('Order').find).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove an order', async () => {
      (mongoose.model('Order').findOneAndDelete as jest.Mock).mockResolvedValueOnce(modelOrder);

      await expect(repository.remove('order-id-1')).resolves.not.toThrow();
      expect(mongoose.model('Order').findOneAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw an ObjectNotFoundException if no order is found', async () => {
      (mongoose.model('Order').findOneAndDelete as jest.Mock).mockResolvedValueOnce(null);

      await expect(repository.remove('order-id-1')).rejects.toThrow(ObjectNotFoundException);
      expect(mongoose.model('Order').findOneAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if an error occurs', async () => {
      const error = new Error('error');
      (mongoose.model('Order').findOneAndDelete as jest.Mock).mockRejectedValueOnce(error);

      await expect(repository.remove('order-id-1')).rejects.toThrow(error);
      expect(mongoose.model('Order').findOneAndDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('store', () => {
    const domainOrder = mapper.mapToDomain(modelOrder);

    it('should create a new order if does not exist', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockResolvedValueOnce(null);
      (mongoose.model('Order').create as jest.Mock).mockResolvedValueOnce(modelOrder);

      const result = await repository.store(domainOrder);
      expect(mongoose.model('Order').create).toHaveBeenCalledTimes(1);

      expect(result.customerId).toBe(domainOrder.customerId);
      expect(result.orderDate).toBe(domainOrder.orderDate);
      expect(result.orderId).toBe(domainOrder.orderId);
      expect(result.orderItems).toBe(domainOrder.orderItems);
      expect(result.totalAmount).toBe(domainOrder.totalAmount);
      expect(result.status.toString()).toEqual(domainOrder.status.toString());
    });

    it('should update an order if it exists', async () => {
      const updatedModelOrder = {
        ...modelOrder,
        orderItems: [{ ...modelOrder.orderItems[0] }, { ...modelOrder.orderItems[1], quantity: 3 }],
      };
      const updatedOrder = mapper.mapToDomain(updatedModelOrder);
      (mongoose.model('Order').findOne as jest.Mock).mockResolvedValueOnce(modelOrder);
      (mongoose.model('Order').findOneAndUpdate as jest.Mock).mockResolvedValueOnce(
        updatedModelOrder,
      );

      const result = await repository.store(updatedOrder, true);
      expect(mongoose.model('Order').findOneAndUpdate).toHaveBeenCalledTimes(1);

      expect(result.customerId).toBe(updatedOrder.customerId);
      expect(result.orderDate).toBe(updatedOrder.orderDate);
      expect(result.orderId).toBe(updatedOrder.orderId);
      expect(result.orderItems).toBe(updatedOrder.orderItems);
      expect(result.totalAmount).toBe(updatedOrder.totalAmount);
      expect(result.status.toString()).toBe(updatedOrder.status.toString());
    });

    it('should throw an InvalidOrderStatusException if try to update the status', async () => {
      const updatedDomainOrder = mapper.mapToDomain({ ...modelOrder, status: 'CONFIRMED' });
      (mongoose.model('Order').findOne as jest.Mock).mockResolvedValueOnce(modelOrder);

      await expect(repository.store(updatedDomainOrder, true)).rejects.toThrow(
        InvalidOrderStatusException,
      );
      expect(mongoose.model('Order').findOneAndUpdate).toHaveBeenCalledTimes(0);
    });

    it('should throw an ObjectNotFoundException if order is not found after update', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockResolvedValueOnce(modelOrder);
      (mongoose.model('Order').findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

      await expect(repository.store(domainOrder, true)).rejects.toThrow(ObjectNotFoundException);
      expect(mongoose.model('Order').findOneAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if an error occurs', async () => {
      const error = new Error('error');
      (mongoose.model('Order').create as jest.Mock).mockRejectedValueOnce(error);

      await expect(repository.store(domainOrder, true)).rejects.toThrow(error);
      expect(mongoose.model('Order').create).toHaveBeenCalledTimes(1);
    });
  });
});
