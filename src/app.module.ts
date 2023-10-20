import EventEmitter from 'events';
import express from 'express';
import helmet from 'helmet';
import { Server } from 'http';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { OrderService } from './application';
import { InstanceNotFoundException } from './domain/exceptions';
import { HealthCheckController } from './handlers/controllers';
import { OrderController, WebhookController } from './handlers/controllers/v1';
import { EventHandler } from './handlers/events';
import { EventTypeMapper } from './handlers/events/mappers';
import { DatabaseModule } from './infrastructure/db/database.module';
import { OrderMapper } from './infrastructure/db/mappers';
import { MongoClient } from './infrastructure/db/mongo/mongo-client';
import { OrderRepository } from './infrastructure/db/repositories';
import { Logger } from './logger.module';

export class AppModule {
  private readonly module = 'AppModule';

  private mongoClient?: MongoClient;

  private databaseModule?: DatabaseModule;

  private eventEmitter?: EventEmitter;

  private eventHandler?: EventHandler;

  private eventTypeMapper?: EventTypeMapper;

  private healthCheckController?: HealthCheckController;

  private orderController?: OrderController;

  private orderMapper?: OrderMapper;

  private orderRepository?: OrderRepository;

  private orderService?: OrderService;

  private server?: Server;

  private webhookController?: WebhookController;

  constructor(private readonly logger: Logger) {}

  public async start(): Promise<void> {
    /** Instantiate the MongoDB Client */
    this.mongoClient = new MongoClient(this.logger);

    /** Instantiate the Database Module */
    this.databaseModule = new DatabaseModule(this.mongoClient);
    const connection = await this.databaseModule.connect();

    /** Instantiate the Mappers */
    this.eventTypeMapper = new EventTypeMapper();
    this.orderMapper = new OrderMapper();

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
    this.orderController = new OrderController(this.logger, this.orderService);
    this.webhookController = new WebhookController(this.eventHandler, this.logger);

    /** Instantiate and Start the Express Server */
    const port = parseInt(process.env.PORT ?? '3000', 10);
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

          /** Disconnect the MongoDB Client */
          if (this.mongoClient) {
            await this.mongoClient.disconnect();
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error stopping the server';
        this.logger.error(errorMessage, { module: this.module, error });
        throw error;
      }

      return;
    }

    throw new InstanceNotFoundException('Server not started');
  }
}
