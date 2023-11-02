import { Request, Response, Router } from 'express';
import { header, validationResult } from 'express-validator';

import { PaymentMapper, ShipmentMapper } from './mappers';
import { ControllerValidationException, MissingEnvVarException } from '../../../domain/exceptions';
import { IEventHandler, ILogger } from '../../../domain/interfaces';

/**
 * @openapi
 * components:
 *  schemas:
 *    PaymentWebhook:
 *      type: object
 *      properties:
 *        amount:
 *          type: number
 *        provider:
 *          type: string
 *        referenceId:
 *          type: string
 *        status:
 *          type: string
 *          enum: [approved, declined, failed]
 *        transactionId:
 *          type: string
 *      required:
 *        - amount
 *        - provider
 *        - referenceId
 *        - status
 *        - transactionId
 *
 *    ShippingWebhook:
 *      type: object
 *      properties:
 *        carrier:
 *          type: string
 *        orderId:
 *          type: string
 *        status:
 *          type: string
 *          enum: [delivered, shipped]
 *        trackingCode:
 *          type: string
 *      required:
 *        - carrier
 *        - orderId
 *        - status
 *        - trackingCode
 */
export class WebhookController {
  private readonly module = 'WebhookController';

  public readonly router: Router;

  constructor(
    private readonly eventHandler: IEventHandler,
    private readonly logger: ILogger,
    private readonly paymentMapper: PaymentMapper,
    private readonly shipmentMapper: ShipmentMapper,
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
     * /webhook/payment:
     *  post:
     *    summary: Payment webhook
     *    description: Callback webhook endpoint for payment provider
     *    tags:
     *      - v1
     *        - Webhook
     *    requestBody:
     *      description: Payment webhook payload
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/schemas/PaymentWebhook'
     *    parameters:
     *      - in: header
     *        name: x-api-key
     *        schema:
     *          type: string
     *        required: true
     *    responses:
     *      204:
     *        description: Webhook received and event emitted
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
      '/v1/webhook/payment',
      header('x-api-key').equals(API_SECRET).withMessage('Unauthorized'),
      (request: Request, response: Response) => {
        const { body, url } = request;
        const { amount, provider, referenceId, status, transactionId } = body;

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

          this.logger.debug('Payment webhook received', {
            module: this.module,
            endpoint: url,
            data: body,
          });

          const event = this.paymentMapper.mapToEvent({
            amount,
            orderId: referenceId,
            provider,
            status,
            transactionId,
          });

          this.eventHandler.emitEvent(event);

          return response.status(204).send();
        } catch (error) {
          if (error instanceof ControllerValidationException) {
            return response.status(401).json(error.message);
          }

          this.logger.error('Error processing payment webhook', {
            module: this.module,
            endpoint: url,
            data: body,
            error,
          });

          return response
            .status(500)
            .send('Error processing payment webhook. Please try again later.');
        }
      },
    );

    /**
     * @openapi
     * /webhook/shipment:
     *  post:
     *    summary: Shipping webhook
     *    description: Webhook endpoint for shipping provider
     *    tags:
     *      - v1
     *        - Webhook
     *    requestBody:
     *      description: Shipping webhook payload
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/schemas/ShippingWebhook'
     *    parameters:
     *      - in: header
     *        name: x-api-key
     *        schema:
     *          type: string
     *        required: true
     *    responses:
     *      204:
     *        description: Webhook received and event emitted
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
      '/v1/webhook/shipment',
      header('x-api-key').equals(API_SECRET).withMessage('Unauthorized'),
      (request: Request, response: Response) => {
        const { body, url } = request;
        const { carrier, orderId, status, trackingCode } = body;

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

          this.logger.debug('Shipping webhook received', {
            module: this.module,
            endpoint: url,
            data: body,
          });

          const event = this.shipmentMapper.mapToEvent({
            carrier,
            orderId,
            status,
            trackingCode,
          });

          this.eventHandler.emitEvent(event);

          return response.status(204).send();
        } catch (error) {
          if (error instanceof ControllerValidationException) {
            return response.status(401).json(error.message);
          }

          this.logger.error('Error processing shipping webhook', {
            module: this.module,
            endpoint: url,
            data: body,
            error,
          });

          return response
            .status(500)
            .send('Error processing shipping webhook. Please try again later.');
        }
      },
    );
  }
}
