import pino from 'pino';

import { ILogger, ILoggerMetadata } from './domain/interfaces';

export class Logger implements ILogger {
  private logger: pino.Logger;

  constructor(private readonly servicePrefix: string) {
    this.logger = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          singleLine: true,
        },
      },
      name: this.servicePrefix,
      level: process.env.LOG_LEVEL || 'info',
      serializers: {
        originalError: e => {
          return this.serializeError(e);
        },
      },
    });
  }

  private serializeError(error: unknown): string {
    return (error as Error).stack ?? (error as Error).message;
  }

  public debug(message: string, metadata: ILoggerMetadata): void {
    this.logger.debug(metadata, message);
  }

  public info(message: string, metadata: ILoggerMetadata): void {
    this.logger.info(metadata, message);
  }

  public warn(message: string, metadata: ILoggerMetadata): void {
    this.logger.warn(metadata, message);
  }

  public error(message: string, metadata: ILoggerMetadata): void {
    this.logger.error(metadata, message);
  }
}
