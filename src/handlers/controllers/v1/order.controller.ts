import { randomUUID } from 'crypto';
import { Request, Response, Router } from 'express';
import { body, header, param, validationResult } from 'express-validator';

import { OrderService } from '../../../application';
import { Order, OrderStatus } from '../../../domain';
import { ControllerValidationException, MissingEnvVarException } from '../../../domain/exceptions';
import { Logger } from '../../../logger.module';

export class OrderController {
  private readonly module = 'OrderController';

  public readonly router: Router;

  constructor(
    private readonly logger: Logger,
    private readonly service: OrderService,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const { API_SECRET } = process.env;
    if (!API_SECRET) {
      throw new MissingEnvVarException('API_SECRET not defined');
    }

    this.router.get(
      '/v1/orders',
      header('x-api-key').equals(API_SECRET).withMessage('Unauthorized'),
      async (request: Request, response: Response) => {
        try {
          const errors = validationResult(request);
          if (!errors.isEmpty()) {
            this.logger.error('API Key validation failed', {
              module: this.module,
              header: request.headers,
              errors,
            });

            throw new ControllerValidationException(errors);
          }

          this.logger.debug('Listing orders endpoint called', {
            module: this.module,
            endpoint: request.url,
          });

          const orders = await this.service.listOrders();

          this.logger.debug('Listing orders endpoint responded', {
            module: this.module,
            endpoint: request.url,
          });

          return response.status(200).json(orders);
        } catch (error) {
          if (error instanceof ControllerValidationException) {
            return response.status(401).json(error.message);
          }

          return response.status(500).json('Internal Server Error');
        }
      },
    );

    this.router.get(
      '/v1/orders/:id',
      header('x-api-key').equals(API_SECRET).withMessage('Unauthorized'),
      param('id').isUUID().withMessage('Invalid Order ID'),
      async (request: Request, response: Response) => {
        const { id } = request.params;

        try {
          const errors = validationResult(request);
          if (!errors.isEmpty()) {
            this.logger.error('API Key validation failed', {
              module: this.module,
              header: request.headers,
              errors,
            });

            throw new ControllerValidationException(errors);
          }

          this.logger.debug('Order details endpoint called', {
            module: this.module,
            endpoint: request.url,
          });

          const orders = await this.service.getOrderDetails(id);

          this.logger.debug('Order details endpoint responded', {
            module: this.module,
            endpoint: request.url,
          });

          return response.status(200).json(orders);
        } catch (error) {
          if (error instanceof ControllerValidationException) {
            if (error.message.includes('Unauthorized')) {
              return response.status(401).json(error.message);
            }

            return response.status(400).json(`Bad request. Error: ${error.message}`);
          }

          return response.status(500).json('Internal Server Error');
        }
      },
    );

    this.router.post(
      '/v1/orders',
      header('x-api-key').equals(API_SECRET).withMessage('Unauthorized'),
      body('customerId').isUUID().withMessage('Invalid Customer ID'),
      body('orderItems').isArray().withMessage('Invalid Order Items'),
      body('orderItems.*.productId').isUUID().withMessage('Invalid Product ID'),
      body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Invalid Quantity'),
      body('orderItems.*.unitPrice').isFloat({ min: 0 }).withMessage('Invalid Unit Price'),
      async (request: Request, response: Response) => {
        const { customerId, orderId, orderDate, orderItems, status } = request.body;

        try {
          const errors = validationResult(request);
          if (!errors.isEmpty()) {
            this.logger.error('API Key validation failed', {
              module: this.module,
              header: request.headers,
              errors,
            });

            throw new ControllerValidationException(errors);
          }

          this.logger.debug('Create order endpoint called', {
            module: this.module,
            endpoint: request.url,
          });

          const order = new Order({
            customerId,
            orderDate: orderDate ? new Date(orderDate) : new Date(),
            orderId: orderId ?? randomUUID(),
            orderItems,
            status: status ? new OrderStatus(status) : new OrderStatus('Pending'),
          });

          await this.service.upsertOrder(order);

          this.logger.debug('Create order endpoint responded', {
            module: this.module,
            endpoint: request.url,
          });

          return response.status(200).json(order);
        } catch (error) {
          if (error instanceof ControllerValidationException) {
            if (error.message.includes('Unauthorized')) {
              return response.status(401).json(error.message);
            }

            return response.status(400).json(`Bad request. Error: ${error.message}`);
          }

          return response.status(500).json('Internal Server Error');
        }
      },
    );
  }
}
