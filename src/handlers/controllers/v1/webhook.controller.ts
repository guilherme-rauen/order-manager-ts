import { Request, Response, Router } from 'express';
import { header, validationResult } from 'express-validator';

import { ControllerValidationException, MissingEnvVarException } from '../../../domain/exceptions';
import { Logger } from '../../../logger.module';
import { EventHandler } from '../../events';

export class WebhookController {
  private readonly module = 'WebhookController';

  public readonly router: Router;

  constructor(
    private readonly eventHandler: EventHandler,
    private readonly logger: Logger,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const { API_SECRET } = process.env;
    if (!API_SECRET) {
      throw new MissingEnvVarException('API_SECRET not defined');
    }

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

          this.eventHandler.emitEvent({
            amount,
            endpoint: url,
            orderId: referenceId,
            provider,
            status,
            transactionId,
          });

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

          this.eventHandler.emitEvent({
            carrier,
            endpoint: url,
            orderId,
            status,
            trackingCode,
          });

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
