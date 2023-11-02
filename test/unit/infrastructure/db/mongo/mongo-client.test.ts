import mongoose from 'mongoose';

import { MongoClient } from '../../../../../src/infrastructure/db/mongo';
import { Logger } from '../../../../../src/logger.module';

jest.mock('mongoose');

describe('MongoClient', () => {
  let mongoClient: MongoClient;
  const connectSpy = jest.spyOn(mongoose, 'connect');
  const disconnectSpy = jest.spyOn(mongoose, 'disconnect');

  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  beforeEach(() => {
    Object.assign(process.env, {
      MONGO_URI: 'mongo-uri',
    });

    mongoClient = new MongoClient(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database successfully', async () => {
    const mockConnection = jest.fn();
    connectSpy.mockResolvedValue(mockConnection as unknown as typeof mongoose);

    const result = await mongoClient.connect();
    expect(result).toBe(mockConnection);
    expect(logger.debug).toHaveBeenCalledWith('Database connected', { module: 'MongoClient' });
  });

  it('should return the existing connection if it exists', async () => {
    const mockConnection = jest.fn();
    mongoClient['connection'] = mockConnection as unknown as typeof mongoose;

    const result = await mongoClient.connect();
    expect(result).toBe(mockConnection);
  });

  it('should throw an error if MONGO_URI is missing', async () => {
    Object.assign(process.env, {
      MONGO_URI: '',
    });

    await expect(mongoClient.connect()).rejects.toThrow('MONGO_URI not found');
    expect(logger.error).toHaveBeenCalledWith('MONGO_URI not found', { module: 'MongoClient' });
  });

  it('should throw an error if database connection fails', async () => {
    connectSpy.mockRejectedValue(new Error('Connection error'));

    await expect(mongoClient.connect()).rejects.toThrow('Connection error');
    expect(logger.error).toHaveBeenCalledWith('Database connection failed', {
      module: 'MongoClient',
    });
  });

  it('should disconnect successfully', () => {
    const mockConnection = {
      disconnect: disconnectSpy.mockResolvedValueOnce(),
    };

    mongoClient['connection'] = mockConnection as unknown as typeof mongoose;

    mongoClient.disconnect();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith('Database disconnected', { module: 'MongoClient' });
  });

  it('should log an error if trying to disconnect without an existing connection', () => {
    mongoClient['connection'] = undefined;
    expect(() => mongoClient.disconnect()).not.toThrow();
    expect(logger.error).toHaveBeenCalledWith('Database connection not found', {
      module: 'MongoClient',
    });
  });
});
