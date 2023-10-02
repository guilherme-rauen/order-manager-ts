import { Request, Response, Router } from 'express';
import { body, header, param, validationResult } from 'express-validator';

import { OrderService } from '../../../application';
import { Order, OrderStatus } from '../../../domain';
import { ControllerValidationException, MissingEnvVarException } from '../../../domain/exceptions';
import { Logger } from '../../../logger.module';

/**
 * @openapi
 * components:
 *  schemas:
 *    Order:
 *      type: object
 *      properties:
 *        customerId:
 *          type: string
 *          format: uuid
 *        orderDate:
 *          type: string
 *          format: date-time
 *        orderId:
 *          type: string
 *          example: ORD-23-0WH1B71878
 *        orderItems:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/OrderItems'
 *      required:
 *        - customerId
 *        - orderItems
 *
 *    OrderItems:
 *      type: object
 *      properties:
 *        productId:
 *          type: string
 *          format: uuid
 *        quantity:
 *          type: integer
 *          format: int32
 *          minimum: 1
 *          example: 2
 *        unitPrice:
 *          type: number
 *          format: float
 *          minimum: 0
 *          example: 17.95
 *      required:
 *        - productId
 *        - quantity
 *        - unitPrice
 */
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

    /**
     * @openapi
     * /orders:
     *  get:
     *    summary: Retrieve a list of orders
     *    description: Get all orders
     *    tags:
     *      - v1
     *        - Orders
     *    parameters:
     *      - in: header
     *        name: x-api-key
     *        schema:
     *          type: string
     *        required: true
     *    responses:
     *      200:
     *        description: List of orders
     *        content:
     *          application/json:
     *            schema:
     *              type: array
     *              items:
     *                $ref: '#/components/schemas/Order'
     *      401:
     *        description: Unauthorized
     *        content:
     *          application/json:
     *            schema:
     *              type: string
     *              example: Unauthorized
     *      500:
     *        description: Internal Server Error
     *        content:
     *          application/json:
     *            schema:
     *              type: string
     *              example: Internal Server Error
     *    security:
     *      - ApiKeyAuth: []
     */
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

    /**
     * @openapi
     * /orders/{orderId}:
     *  get:
     *    summary: Retrieve an order details
     *    description: Get an order
     *    tags:
     *      - v1
     *        - Orders
     *    parameters:
     *      - in: header
     *        name: x-api-key
     *        schema:
     *          type: string
     *        required: true
     *      - in: path
     *        name: orderId
     *        schema:
     *          type: string
     *          example: ORD-23-0WH1B71878
     *        required: true
     *    responses:
     *      200:
     *        description: Order details
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/Order'
     *      400:
     *        description: Bad request
     *        content:
     *          application/json:
     *            schema:
     *              type: string
     *              example: Invalid Order ID
     *      401:
     *        description: Unauthorized
     *        content:
     *          application/json:
     *            schema:
     *              type: string
     *              example: Unauthorized
     *      500:
     *        description: Internal Server Error
     *        content:
     *          application/json:
     *            schema:
     *              type: string
     *              example: Internal Server Error
     *    security:
     *      - ApiKeyAuth: []
     */
    this.router.get(
      '/v1/orders/:orderId',
      header('x-api-key').equals(API_SECRET).withMessage('Unauthorized'),
      param('orderId')
        .custom(orderId => (Order.validateOrderId(orderId) ? true : false))
        .withMessage('Invalid Order ID'),
      async (request: Request, response: Response) => {
        const { orderId } = request.params;

        try {
          const errors = validationResult(request);
          if (!errors.isEmpty()) {
            this.logger.error('Controller validation error', {
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

          const order = await this.service.getOrderDetails(orderId);

          this.logger.debug('Order details endpoint responded', {
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

    /**
     * @openapi
     * /orders:
     *  post:
     *    summary: Create or update an order
     *    description: Upsert an order
     *    tags:
     *      - v1
     *        - Orders
     *    requestBody:
     *      description: Order object
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/schemas/Order'
     *    parameters:
     *      - in: header
     *        name: x-api-key
     *        schema:
     *          type: string
     *        required: true
     *    responses:
     *      200:
     *        description: Order details
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/Order'
     *      400:
     *        description: Bad request
     *        content:
     *          application/json:
     *            schema:
     *              type: string
     *              example: Invalid Order ID
     *      401:
     *        description: Unauthorized
     *        content:
     *          application/json:
     *            schema:
     *              type: string
     *              example: Unauthorized
     *      500:
     *        description: Internal Server Error
     *        content:
     *          application/json:
     *            schema:
     *              type: string
     *              example: Internal Server Error
     *    security:
     *      - ApiKeyAuth: []
     */
    this.router.post(
      '/v1/orders',
      header('x-api-key').equals(API_SECRET).withMessage('Unauthorized'),
      body('customerId').isUUID().withMessage('Invalid Customer ID'),
      body('orderId')
        .custom(orderId => (Order.validateOrderId(orderId) ? true : false))
        .withMessage('Invalid Order ID')
        .optional(),
      body('orderItems').isArray().withMessage('Invalid Order Items'),
      body('orderItems.*.productId').isUUID().withMessage('Invalid Product ID'),
      body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Invalid Quantity'),
      body('orderItems.*.unitPrice').isFloat({ min: 0 }).withMessage('Invalid Unit Price'),
      async (request: Request, response: Response) => {
        const { customerId, orderId, orderDate, orderItems, status } = request.body;

        try {
          const errors = validationResult(request);
          if (!errors.isEmpty()) {
            this.logger.error('Controller validation error', {
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
            orderId,
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
