import express from 'express';
import { Server } from 'http';
import mongoose from 'mongoose';
import request from 'supertest';

import { OrderService } from '../../../../src/application';
import { OrderStatus } from '../../../../src/domain';
import { MissingEnvVarException } from '../../../../src/domain/exceptions';
import { IOrder } from '../../../../src/domain/interfaces';
import { OrderController } from '../../../../src/handlers/controllers/v1';
import { OrderMapper } from '../../../../src/infrastructure/db/mappers';
import { OrderRepository } from '../../../../src/infrastructure/db/repositories';
import { Logger } from '../../../../src/logger.module';

jest.mock('mongoose');

describe('OrderController', () => {
  let app: express.Application;
  let server: Server;
  let service: OrderService;

  const envVars = { API_SECRET: 'test-secret-api' };
  process.env = Object.assign(process.env, envVars);

  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const date = new Date();
  const orderId = 'ORD-23-0WH1B71878';
  const price = 17.99;
  const modelOrder: IOrder = {
    orderId,
    orderDate: date,
    orderItems: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 1,
        unitPrice: price,
      },
    ],
    totalAmount: price,
    status: 'PENDING',
    customerId: '550e8400-e29b-41d4-a716-446655440002',
  };
  const payload = {
    customerId: modelOrder.customerId,
    orderItems: modelOrder.orderItems,
  };

  beforeEach(() => {
    mongoose.model = jest.fn().mockReturnValue({
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
    } as unknown);

    const repository = new OrderRepository(mongoose, logger, new OrderMapper());
    service = new OrderService(logger, repository);
    const controller = new OrderController(logger, service);

    app = express();
    app.use(express.json());
    app.use('/api', controller.router);
    server = app.listen();
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.env = Object.assign(process.env, envVars);
    server.close();
    server.unref();
  });

  describe('constructor', () => {
    it('should throw MissingEnvVarException if secret api is not set', async () => {
      process.env = Object.assign(process.env, {
        API_SECRET: '',
      });

      expect(() => new OrderController(logger, service)).toThrow(MissingEnvVarException);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should return 200 (OK) on success', async () => {
      (mongoose.model('Order').find as jest.Mock).mockResolvedValueOnce([modelOrder]);
      const result = await request(server)
        .get('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .expect(200);

      expect(result.body).toHaveLength(1);
      expect(result.body[0].customerId).toBe(modelOrder.customerId);
      expect(result.body[0].orderDate).toBe(date.toISOString());
      expect(result.body[0].orderId).toBe(modelOrder.orderId);
      expect(result.body[0].orderItems).toHaveLength(1);
      expect(result.body[0].orderItems[0].productId).toBe(modelOrder.orderItems[0].productId);
      expect(result.body[0].orderItems[0].quantity).toBe(modelOrder.orderItems[0].quantity);
      expect(result.body[0].orderItems[0].unitPrice).toBe(modelOrder.orderItems[0].unitPrice);
      expect(result.body[0].status.value).toEqual(modelOrder.status);
      expect(result.body[0].totalAmount).toBe(price);
    });

    it('should return 401 (Unauthorized) with x-api-key is missing', async () => {
      const response = await request(server).get('/api/v1/orders').expect(401);
      expect(response.body).toBe('Unauthorized');
    });

    it('should return 401 (Unauthorized) with x-api-key is invalid', async () => {
      const response = await request(server)
        .get('/api/v1/orders')
        .set('x-api-key', 'invalid-api-key')
        .expect(401);

      expect(response.body).toBe('Unauthorized');
    });

    it('should return 500 (Internal Server Error) on error', async () => {
      (mongoose.model('Order').find as jest.Mock).mockRejectedValueOnce(() => {
        throw new Error('Test error');
      });

      const response = await request(server)
        .get('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .expect(500);

      expect(response.body).toBe('Internal Server Error');
    });
  });

  describe('GET /api/v1/orders/:orderId', () => {
    it('should return 200 (OK) on success', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockResolvedValueOnce(modelOrder);
      const result = await request(server)
        .get(`/api/v1/orders/${orderId}`)
        .set('x-api-key', envVars.API_SECRET)
        .expect(200);

      expect(result.body.customerId).toBe(modelOrder.customerId);
      expect(result.body.orderDate).toBe(date.toISOString());
      expect(result.body.orderId).toBe(orderId);
      expect(result.body.orderItems).toHaveLength(1);
      expect(result.body.orderItems[0].productId).toBe(modelOrder.orderItems[0].productId);
      expect(result.body.orderItems[0].quantity).toBe(modelOrder.orderItems[0].quantity);
      expect(result.body.orderItems[0].unitPrice).toBe(modelOrder.orderItems[0].unitPrice);
      expect(result.body.status.value).toEqual(modelOrder.status);
      expect(result.body.totalAmount).toBe(price);
    });

    it('should return 400 (Bad Request) with invalid order id', async () => {
      const response = await request(server)
        .get('/api/v1/orders/invalid-order-id')
        .set('x-api-key', envVars.API_SECRET)
        .expect(400);

      expect(response.body).toBe('Bad request. Error: Invalid Order ID');
    });

    it('should return 401 (Unauthorized) with x-api-key is missing', async () => {
      const response = await request(server).get(`/api/v1/orders/${orderId}`).expect(401);
      expect(response.body).toBe('Unauthorized');
    });

    it('should return 401 (Unauthorized) with x-api-key is invalid', async () => {
      const response = await request(server)
        .get(`/api/v1/orders/${orderId}`)
        .set('x-api-key', 'invalid-api-key')
        .expect(401);

      expect(response.body).toBe('Unauthorized');
    });

    it('should return 500 (Internal Server Error) on error', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockRejectedValueOnce(() => {
        throw new Error('Test error');
      });

      const response = await request(server)
        .get(`/api/v1/orders/${orderId}`)
        .set('x-api-key', envVars.API_SECRET)
        .expect(500);

      expect(response.body).toBe('Internal Server Error');
    });
  });

  describe('GET /api/v1/orders/customer/:customerId', () => {
    it('should return 200 (OK) on success', async () => {
      (mongoose.model('Order').find as jest.Mock).mockResolvedValueOnce([modelOrder]);
      const result = await request(server)
        .get(`/api/v1/orders/customer/${modelOrder.customerId}`)
        .set('x-api-key', envVars.API_SECRET)
        .expect(200);

      expect(result.body).toHaveLength(1);
      expect(result.body[0].customerId).toBe(modelOrder.customerId);
      expect(result.body[0].orderDate).toBe(date.toISOString());
      expect(result.body[0].orderId).toBe(modelOrder.orderId);
      expect(result.body[0].orderItems).toHaveLength(1);
      expect(result.body[0].orderItems[0].productId).toBe(modelOrder.orderItems[0].productId);
      expect(result.body[0].orderItems[0].quantity).toBe(modelOrder.orderItems[0].quantity);
      expect(result.body[0].orderItems[0].unitPrice).toBe(modelOrder.orderItems[0].unitPrice);
      expect(result.body[0].status.value).toEqual(modelOrder.status);
      expect(result.body[0].totalAmount).toBe(price);
    });

    it('should return 400 (Bad Request) with invalid customer id', async () => {
      const response = await request(server)
        .get('/api/v1/orders/customer/invalid-customer-id')
        .set('x-api-key', envVars.API_SECRET)
        .expect(400);

      expect(response.body).toBe('Bad request. Error: Invalid Customer ID');
    });

    it('should return 401 (Unauthorized) with x-api-key is missing', async () => {
      const response = await request(server)
        .get(`/api/v1/orders/customer/${modelOrder.customerId}`)
        .expect(401);
      expect(response.body).toBe('Unauthorized');
    });

    it('should return 401 (Unauthorized) with x-api-key is invalid', async () => {
      const response = await request(server)
        .get(`/api/v1/orders/customer/${modelOrder.customerId}`)
        .set('x-api-key', 'invalid-api-key')
        .expect(401);

      expect(response.body).toBe('Unauthorized');
    });

    it('should return 500 (Internal Server Error) on error', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockRejectedValueOnce(() => {
        throw new Error('Test error');
      });

      const response = await request(server)
        .get(`/api/v1/orders/customer/${modelOrder.customerId}`)
        .set('x-api-key', envVars.API_SECRET)
        .expect(500);

      expect(response.body).toBe('Internal Server Error');
    });
  });

  describe('GET /api/v1/orders/status/:status', () => {
    it('should return 200 (OK) on success', async () => {
      (mongoose.model('Order').find as jest.Mock).mockResolvedValueOnce([modelOrder]);
      const result = await request(server)
        .get(`/api/v1/orders/status/${modelOrder.status}`)
        .set('x-api-key', envVars.API_SECRET)
        .expect(200);

      expect(result.body).toHaveLength(1);
      expect(result.body[0].customerId).toBe(modelOrder.customerId);
      expect(result.body[0].orderDate).toBe(date.toISOString());
      expect(result.body[0].orderId).toBe(modelOrder.orderId);
      expect(result.body[0].orderItems).toHaveLength(1);
      expect(result.body[0].orderItems[0].productId).toBe(modelOrder.orderItems[0].productId);
      expect(result.body[0].orderItems[0].quantity).toBe(modelOrder.orderItems[0].quantity);
      expect(result.body[0].orderItems[0].unitPrice).toBe(modelOrder.orderItems[0].unitPrice);
      expect(result.body[0].status.value).toEqual(modelOrder.status);
      expect(result.body[0].totalAmount).toBe(price);
    });

    it('should return 400 (Bad Request) with invalid status', async () => {
      const response = await request(server)
        .get('/api/v1/orders/status/invalid-status')
        .set('x-api-key', envVars.API_SECRET)
        .expect(400);

      expect(response.body).toBe('Bad request. Error: Invalid Status');
    });

    it('should return 401 (Unauthorized) with x-api-key is missing', async () => {
      const response = await request(server)
        .get(`/api/v1/orders/status/${modelOrder.status}`)
        .expect(401);
      expect(response.body).toBe('Unauthorized');
    });

    it('should return 401 (Unauthorized) with x-api-key is invalid', async () => {
      const response = await request(server)
        .get(`/api/v1/orders/status/${modelOrder.status}`)
        .set('x-api-key', 'invalid-api-key')
        .expect(401);

      expect(response.body).toBe('Unauthorized');
    });

    it('should return 500 (Internal Server Error) on error', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockRejectedValueOnce(() => {
        throw new Error('Test error');
      });

      const response = await request(server)
        .get(`/api/v1/orders/status/${modelOrder.status}`)
        .set('x-api-key', envVars.API_SECRET)
        .expect(500);

      expect(response.body).toBe('Internal Server Error');
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should return 200 (OK) on success - create', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockResolvedValueOnce(null);
      (mongoose.model('Order').create as jest.Mock).mockResolvedValueOnce(modelOrder);
      const result = await request(server)
        .post('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .send(payload)
        .expect(200);

      expect(result.body.customerId).toBe(payload.customerId);
      expect(result.body.orderDate).toBeDefined();
      expect(result.body.orderId).toBeDefined();
      expect(result.body.orderItems).toHaveLength(1);
      expect(result.body.orderItems[0].productId).toBe(payload.orderItems[0].productId);
      expect(result.body.orderItems[0].quantity).toBe(payload.orderItems[0].quantity);
      expect(result.body.orderItems[0].unitPrice).toBe(payload.orderItems[0].unitPrice);
      expect(result.body.status).toEqual(new OrderStatus('pending'));
      expect(result.body.totalAmount).toBe(price);
    });

    it('should return 200 (OK) on success - update', async () => {
      const newQuantity = 2;
      const updatePayload = {
        ...payload,
        orderItems: [{ ...payload.orderItems[0], quantity: newQuantity }],
        orderDate: date.toISOString(),
        orderId,
        status: 'PENDING',
      };
      const updatedModelOrder = {
        ...modelOrder,
        orderItems: [{ ...modelOrder.orderItems[0], quantity: newQuantity }],
      };

      (mongoose.model('Order').findOne as jest.Mock).mockResolvedValueOnce(modelOrder);
      (mongoose.model('Order').findOneAndUpdate as jest.Mock).mockResolvedValueOnce(
        updatedModelOrder,
      );

      const result = await request(server)
        .post('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .send(updatePayload)
        .expect(200);

      expect(result.body.customerId).toBe(updatePayload.customerId);
      expect(result.body.orderDate).toBe(updatePayload.orderDate);
      expect(result.body.orderId).toBe(updatePayload.orderId);
      expect(result.body.orderItems).toHaveLength(1);
      expect(result.body.orderItems[0].productId).toBe(updatePayload.orderItems[0].productId);
      expect(result.body.orderItems[0].quantity).toBe(updatePayload.orderItems[0].quantity);
      expect(result.body.orderItems[0].unitPrice).toBe(updatePayload.orderItems[0].unitPrice);
      expect(result.body.status).toEqual(new OrderStatus(updatePayload.status));
      expect(result.body.totalAmount).toBe(price * newQuantity);
    });

    it('should return 400 (Bad Request) with invalid customer id', async () => {
      const response = await request(server)
        .post('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .send({
          ...payload,
          customerId: 'invalid-customer-id',
        })
        .expect(400);

      expect(response.body).toBe('Bad request. Error: Invalid Customer ID');
    });

    it('should return 400 (Bad Request) with invalid order date', async () => {
      const response = await request(server)
        .post('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .send({
          ...payload,
          orderDate: '2023.01.01 00:00:00',
          orderId,
          status: 'invalid-status',
        })
        .expect(400);

      expect(response.body).toBe('Bad request. Error: Invalid Order Date');
    });

    it('should return 400 (Bad Request) with invalid order id', async () => {
      const response = await request(server)
        .post('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .send({
          ...payload,
          orderId: 'invalid-order-id',
        })
        .expect(400);

      expect(response.body).toBe('Bad request. Error: Invalid Order ID');
    });

    it('should return 400 (Bad Request) with invalid order items', async () => {
      const response = await request(server)
        .post('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .send({
          ...payload,
          orderItems: [
            {
              productId: 'invalid-product-id',
              quantity: 1,
              unitPrice: 17.99,
            },
          ],
        })
        .expect(400);

      expect(response.body).toBe('Bad request. Error: Invalid Product ID');
    });

    it('should return 400 (Bad Request) with invalid status', async () => {
      const response = await request(server)
        .post('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .send({
          ...payload,
          orderDate: date.toISOString(),
          orderId,
          status: 'invalid-status',
        })
        .expect(400);

      expect(response.body).toBe('Bad request. Error: Invalid Status');
    });

    it('should return 401 (Unauthorized) with x-api-key is missing', async () => {
      const response = await request(server).post('/api/v1/orders').send(payload).expect(401);
      expect(response.body).toBe('Unauthorized');
    });

    it('should return 401 (Unauthorized) with x-api-key is invalid', async () => {
      const response = await request(server)
        .post('/api/v1/orders')
        .set('x-api-key', 'invalid-api-key')
        .send(payload)
        .expect(401);

      expect(response.body).toBe('Unauthorized');
    });

    it('should return 500 (Internal Server Error) on error', async () => {
      (mongoose.model('Order').findOne as jest.Mock).mockRejectedValueOnce(() => {
        throw new Error('Test error');
      });

      const response = await request(server)
        .post('/api/v1/orders')
        .set('x-api-key', envVars.API_SECRET)
        .send(payload)
        .expect(500);

      expect(response.body).toBe('Internal Server Error');
    });
  });
});
