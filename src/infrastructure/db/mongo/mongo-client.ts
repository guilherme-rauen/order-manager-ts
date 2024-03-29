import mongoose from 'mongoose';

import { MissingEnvVarException } from '../../../domain/exceptions';
import { ILogger } from '../../../domain/interfaces';

export class MongoClient {
  private readonly module = 'MongoClient';

  private connection?: typeof mongoose;

  constructor(private readonly logger: ILogger) {}

  public async connect(): Promise<typeof mongoose> {
    if (this.connection) {
      return this.connection;
    }

    const { APP_NAME, MONGO_URI } = process.env;
    if (!MONGO_URI) {
      this.logger.error('MONGO_URI not found', { module: this.module });
      throw new MissingEnvVarException('MONGO_URI not found');
    }

    try {
      this.connection = await mongoose.connect(MONGO_URI, {
        authMechanism: 'DEFAULT',
        dbName: APP_NAME || 'test',
      });

      this.logger.debug('Database connected', { module: this.module });
      return this.connection;
    } catch (error) {
      this.logger.error('Database connection failed', { module: this.module });
      throw error;
    }
  }

  public disconnect(): void {
    if (this.connection) {
      this.connection.disconnect();
      this.logger.debug('Database disconnected', { module: this.module });
      return;
    }

    this.logger.error('Database connection not found', { module: this.module });
    return;
  }
}
