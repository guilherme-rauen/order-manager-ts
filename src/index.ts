import dotenv from 'dotenv';

import { AppModule } from './app.module';
import { Logger } from './logger.module';

dotenv.config();

const logger = new Logger(process.env.APP_NAME ?? '');
const app = new AppModule(logger);
const main = async (): Promise<void> => {
  await app.start();
};

main().catch(error => {
  logger.error(error.message, { module: 'index', error });
  process.exit(1);
});

process.on('uncaughtException', error => {
  logger.error(`Uncaught exception error caught: ${error.message}`, { module: 'index', error });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`, { module: 'index' });
});
