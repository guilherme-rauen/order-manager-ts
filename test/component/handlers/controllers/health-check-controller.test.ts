import express from 'express';
import { Server } from 'http';
import request from 'supertest';

import { HealthCheckController } from '../../../../src/handlers/controllers';

describe('HealthCheckController', () => {
  let app: express.Application;
  let server: Server;

  beforeEach(() => {
    const controller = new HealthCheckController();

    app = express();
    app.use(express.json());
    app.use('/', controller.router);
    server = app.listen();
  });

  afterEach(() => {
    server.close();
    server.unref();
  });

  describe('GET /', () => {
    it('should return 200 (OK) on success', async () => {
      const result = await request(server).get('/').expect(200);
      expect(result.body).toBe('Order Management System using Domain-Driven Design (DDD).');
    });
  });
});
