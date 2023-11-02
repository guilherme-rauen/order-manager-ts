import EventEmitter from 'events';
import express from 'express';
import helmet from 'helmet';
import { Server } from 'http';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { OrderService } from './application';
import { ILogger } from './domain/interfaces';
import { HealthCheckController } from './handlers/controllers';
import { OrderController, WebhookController } from './handlers/controllers/v1';
import { PaymentMapper, ShipmentMapper } from './handlers/controllers/v1/mappers';
import { EventHandler } from './handlers/events';
import { EventTypeMapper } from './handlers/events/mappers';
import { DatabaseModule } from './infrastructure/db/database.module';
import { OrderMapper } from './infrastructure/db/mappers';
import { PrismaClient } from './infrastructure/db/prisma';
import { OrderRepository } from './infrastructure/db/repositories';

export class AppModule {
  private readonly module = 'AppModule';

  private databaseModule?: DatabaseModule;

  private eventEmitter?: EventEmitter;

  private eventHandler?: EventHandler;

  private eventTypeMapper?: EventTypeMapper;

  private healthCheckController?: HealthCheckController;

  private orderController?: OrderController;

  private orderMapper?: OrderMapper;

  private orderRepository?: OrderRepository;

  private orderService?: OrderService;

  private paymentMapper?: PaymentMapper;

  private prismaClient?: PrismaClient;

  private server?: Server;

  private shipmentMapper?: ShipmentMapper;

  private webhookController?: WebhookController;

  constructor(private readonly logger: ILogger) {}

  public async start(): Promise<void> {
    /** Instantiate the Prisma Client */
    this.prismaClient = new PrismaClient(this.logger);

    /** Instantiate the Database Module */
    this.databaseModule = new DatabaseModule(this.prismaClient);
    const connection = await this.databaseModule.connect();

    /** Instantiate the Mappers */
    this.eventTypeMapper = new EventTypeMapper();
    this.orderMapper = new OrderMapper();
    this.paymentMapper = new PaymentMapper();
    this.shipmentMapper = new ShipmentMapper();

    /** Instantiate the Repositories */
    this.orderRepository = new OrderRepository(connection, this.logger, this.orderMapper);

    /** Instantiate the Services */
    this.orderService = new OrderService(this.logger, this.orderRepository);

    /** Instantiate the Event Handlers */
    this.eventEmitter = new EventEmitter();
    this.eventHandler = new EventHandler(
      this.eventEmitter,
      this.logger,
      this.eventTypeMapper,
      this.orderService,
    );

    /** Instantiate the Controllers */
    this.healthCheckController = new HealthCheckController();
    this.orderController = new OrderController(this.eventHandler, this.logger, this.orderService);
    this.webhookController = new WebhookController(
      this.eventHandler,
      this.logger,
      this.paymentMapper,
      this.shipmentMapper,
    );

    /** Instantiate and Start the Express Server */
    const port = parseInt(process.env.PORT || '3000', 10);
    const app = express();
    app.use(express.json());
    app.use(helmet());
    app.disable('x-powered-by');

    const options = {
      definition: {
        openapi: '3.1.0',
        info: {
          title: 'Order Manager API',
          version: '1.0.0',
        },
      },
      apis: ['src/handlers/controllers/v1/*.ts'],
    };
    const apiDocs = swaggerJsdoc(options);

    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiDocs));
    app.use('/api', this.orderController.router);
    app.use('/api', this.webhookController.router);
    app.use('/', this.healthCheckController.router);

    this.server = app.listen(port, () => {
      this.logger.debug(`Server up & running at http://localhost:${port}`, {
        module: this.module,
      });
    });

    return;
  }

  public async stop(): Promise<void> {
    /** Stop the Express Server Instance */
    if (this.server) {
      try {
        await this.server.close(async () => {
          this.logger.debug('Server stopped', { module: this.module });

          /** Remove all the Event Listeners */
          if (this.eventEmitter) {
            this.eventEmitter.removeAllListeners();
            this.logger.debug('Event Listeners removed', { module: this.module });
          }

          /** Disconnect the Prisma Client */
          if (this.prismaClient) {
            await this.prismaClient.disconnect();
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error stopping the server';
        this.logger.error(errorMessage, { module: this.module, originalError: error });
        throw error;
      }

      return;
    }

    throw new Error('Server not started');
  }
}
