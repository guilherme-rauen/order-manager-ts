import { PrismaClient as Prisma } from '@prisma/client';

import { MissingEnvVarException } from '../../../domain/exceptions';
import { Logger } from '../../../logger.module';

export class PrismaClient {
  private readonly module = 'PrismaClient';

  private connection?: Prisma;

  constructor(private readonly logger: Logger) {}

  public async connect(): Promise<Prisma> {
    if (this.connection) {
      return this.connection;
    }

    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) {
      throw new MissingEnvVarException('DATABASE_URL not found');
    }

    try {
      const client = new Prisma();
      await client.$connect();
      this.connection = client;

      this.logger.debug('Database connected', { module: this.module });
      return this.connection;
    } catch (error) {
      this.logger.error('Database connection failed', {
        module: this.module,
        originalError: error,
      });

      throw error;
    }
  }

  public disconnect(): void {
    if (this.connection) {
      this.connection.$disconnect();
      this.logger.debug('Database disconnected', { module: this.module });
      return;
    }

    this.logger.error('Database connection not found', { module: this.module });
    return;
  }
}
