import express from 'express';
import { Server } from 'http';
import request from 'supertest';

import { MissingEnvVarException } from '../../../../src/domain/exceptions';
import { WebhookController } from '../../../../src/handlers/controllers/v1';
import { PaymentMapper, ShipmentMapper } from '../../../../src/handlers/controllers/v1/mappers';
import { EventHandler } from '../../../../src/handlers/events';
import { Logger } from '../../../../src/logger.module';

describe('WebhookController', () => {
  let app: express.Application;
  let server: Server;

  const envVars = { API_SECRET: 'test-secret-api' };
  process.env = Object.assign(process.env, envVars);

  const paymentMapper = new PaymentMapper();
  const shipmentMapper = new ShipmentMapper();

  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const eventHandler = {
    emitEvent: jest.fn(),
  } as unknown as EventHandler;

  const emitEventSpy = jest.spyOn(eventHandler, 'emitEvent');

  const paymentPayload = {
    amount: 100,
    provider: 'provider',
    referenceId: 'order-id',
    status: 'approved',
    transactionId: 'transaction-id',
  };

  const shipmentPayload = {
    carrier: 'carrier',
    orderId: 'order-id',
    status: 'shipped',
    trackingCode: 'tracking-code',
  };

  beforeEach(() => {
    const controller = new WebhookController(eventHandler, logger, paymentMapper, shipmentMapper);

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

      expect(
        () => new WebhookController(eventHandler, logger, paymentMapper, shipmentMapper),
      ).toThrow(MissingEnvVarException);
    });
  });

  describe('POST /api/v1/webhook/payment', () => {
    it('should return 204 (No Content) on success', async () => {
      emitEventSpy.mockReturnValueOnce();

      await request(server)
        .post('/api/v1/webhook/payment')
        .set('x-api-key', envVars.API_SECRET)
        .send(paymentPayload)
        .expect(204);
    });

    it('should return 401 (Unauthorized) if API_SECRET is missing', async () => {
      await request(server).post('/api/v1/webhook/payment').send(paymentPayload).expect(401);
    });

    it('should return 401 (Unauthorized) if API_SECRET is invalid', async () => {
      await request(server)
        .post('/api/v1/webhook/payment')
        .set('x-api-key', 'invalid')
        .send(paymentPayload)
        .expect(401);
    });

    it('should return 500 (Internal Server Error) if event handler throws an error', async () => {
      emitEventSpy.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      await request(server)
        .post('/api/v1/webhook/payment')
        .set('x-api-key', envVars.API_SECRET)
        .send(paymentPayload)
        .expect(500);
    });
  });

  describe('POST /api/v1/webhook/shipment', () => {
    it('should return 204 (No Content) on success', async () => {
      emitEventSpy.mockReturnValueOnce();

      await request(server)
        .post('/api/v1/webhook/shipment')
        .set('x-api-key', envVars.API_SECRET)
        .send(shipmentPayload)
        .expect(204);
    });

    it('should return 401 (Unauthorized) if API_SECRET is missing', async () => {
      await request(server).post('/api/v1/webhook/shipment').send(shipmentPayload).expect(401);
    });

    it('should return 401 (Unauthorized) if API_SECRET is invalid', async () => {
      await request(server)
        .post('/api/v1/webhook/shipment')
        .set('x-api-key', 'invalid')
        .send(shipmentPayload)
        .expect(401);
    });

    it('should return 500 (Internal Server Error) if event handler throws an error', async () => {
      emitEventSpy.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      await request(server)
        .post('/api/v1/webhook/shipment')
        .set('x-api-key', envVars.API_SECRET)
        .send(shipmentPayload)
        .expect(500);
    });
  });
});
