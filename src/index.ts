import dotenv from 'dotenv';

import { AppModule } from './app.module';
import { Logger } from './logger.module';

dotenv.config();

try {
  const logger = new Logger(process.env.APP_NAME ?? '');
  const app = new AppModule(logger);
  const main = async (): Promise<void> => {
    await app.start();
  };

  main().catch(error => {
    logger.error(error.message, { error, module: 'index' });
    process.exit(1);
  });
} catch (error) {
  console.error(`Failed to initialize - ${error}`);
  process.exit(1);
}
