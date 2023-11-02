import { PrismaClient as Prisma } from '@prisma/client';

import { MissingEnvVarException } from '../../../../../src/domain/exceptions';
import { PrismaClient } from '../../../../../src/infrastructure/db/prisma';
import { Logger } from '../../../../../src/logger.module';

const mockedPrisma = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockedPrisma),
}));

describe('PrismaClient', () => {
  let prismaClient: PrismaClient;

  const logger = {
    debug: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  beforeEach(() => {
    Object.assign(process.env, {
      DATABASE_URL: 'postgres://user:password@localhost:5432/mydb',
    });

    prismaClient = new PrismaClient(logger);
  });

  describe('connect', () => {
    it('should connect to the database and return the connection', async () => {
      const client = await prismaClient.connect();
      expect(client).toEqual(mockedPrisma);
      expect(mockedPrisma.$connect).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith('Database connected', { module: 'PrismaClient' });
    });

    it('should return the connection if it already exists', async () => {
      prismaClient['connection'] = mockedPrisma as unknown as Prisma;
      const client = await prismaClient.connect();
      expect(client).toEqual(mockedPrisma);
    });

    it('should throw MissingEnvVarException if DATABASE_URL is not set', async () => {
      delete process.env.DATABASE_URL;
      await expect(prismaClient.connect()).rejects.toThrow(MissingEnvVarException);
    });

    it('should throw an error if the connection fails', async () => {
      mockedPrisma.$connect.mockRejectedValue(new Error('Connection failed'));
      await expect(prismaClient.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect if a connection exists', () => {
      prismaClient['connection'] = mockedPrisma as unknown as Prisma;
      prismaClient.disconnect();
      expect(mockedPrisma.$disconnect).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith('Database disconnected', {
        module: 'PrismaClient',
      });
    });

    it('should log an error if no connection exists', () => {
      prismaClient.disconnect();
      expect(logger.error).toHaveBeenCalledWith('Database connection not found', {
        module: 'PrismaClient',
      });
    });
  });
});
