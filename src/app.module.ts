import express from 'express';
import helmet from 'helmet';
import { Server } from 'http';

import { Logger } from './logger.module';

export class AppModule {
  private readonly module = 'AppModule';

  private server?: Server;

  constructor(private readonly logger: Logger) {}

  public start(): void {
    /** Instantiate and Start the Express Server */
    const port = parseInt(process.env.PORT ?? '3000', 10);
    const app = express();
    app.use(express.json());
    app.use(helmet());
    app.disable('x-powered-by');

    this.server = app.listen(port, () => {
      this.logger.debug(`Server up & running at http://localhost:${port}`, {
        module: this.module,
      });
    });

    return;
  }

  public stop(): void {
    /** Stop the Express Server Instance */
    if (this.server) {
      this.server.close(() => this.logger.debug('Server stopped', { module: this.module }));
      return;
    }

    throw new Error('Server not started');
  }
}
