import { PrismaClient as Prisma } from '@prisma/client';

import { PrismaClient } from './prisma/prisma-client';

export class DatabaseModule {
  constructor(private readonly client: PrismaClient) {}

  public async connect(): Promise<Prisma> {
    return await this.client.connect();
  }

  public disconnect(): void {
    return this.client.disconnect();
  }
}
