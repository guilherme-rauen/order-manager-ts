import { PrismaClient as Prisma } from '@prisma/client';

import { DatabaseModule } from '../../../../src/infrastructure/db/database.module';
import { PrismaClient } from '../../../../src/infrastructure/db/prisma';
import { Logger } from '../../../../src/logger.module';

jest.mock('../../../../src/infrastructure/db/prisma/prisma-client');

describe('DatabaseModule', () => {
  let prismaClientMock: jest.Mocked<PrismaClient>;
  let databaseModule: DatabaseModule;

  const logger = {
    error: jest.fn(),
  } as unknown as Logger;

  beforeEach(() => {
    prismaClientMock = new PrismaClient(logger) as jest.Mocked<PrismaClient>;
    databaseModule = new DatabaseModule(prismaClientMock);
  });

  it('should connect to the database', async () => {
    const mockResponse = jest.fn() as unknown as Prisma;
    prismaClientMock.connect.mockResolvedValue(mockResponse);

    const result = await databaseModule.connect();
    expect(prismaClientMock.connect).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResponse);
  });

  it('should disconnect from the database', () => {
    databaseModule.disconnect();
    expect(prismaClientMock.disconnect).toHaveBeenCalledTimes(1);
  });
});
