import mongoose from 'mongoose';

import { DatabaseModule } from '../../../../src/infrastructure/db/database.module';
import { MongoClient } from '../../../../src/infrastructure/db/mongo/mongo-client';
import { Logger } from '../../../../src/logger.module';

jest.mock('../../../../src/infrastructure/db/mongo/mongo-client');

describe('DatabaseModule', () => {
  let mongoClientMock: jest.Mocked<MongoClient>;
  let databaseModule: DatabaseModule;

  const logger = {
    error: jest.fn(),
  } as unknown as Logger;

  beforeEach(() => {
    mongoClientMock = new MongoClient(logger) as jest.Mocked<MongoClient>;
    databaseModule = new DatabaseModule(mongoClientMock);
  });

  it('should connect to the database', async () => {
    const mockResponse = jest.fn();
    mongoClientMock.connect.mockResolvedValue(mockResponse as unknown as typeof mongoose);

    const result = await databaseModule.connect();
    expect(mongoClientMock.connect).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResponse);
  });

  it('should disconnect from the database', () => {
    databaseModule.disconnect();
    expect(mongoClientMock.disconnect).toHaveBeenCalledTimes(1);
  });
});
