import mongoose from 'mongoose';

import { MongoClient } from './mongo';

export class DatabaseModule {
  constructor(private readonly client: MongoClient) {}

  public async connect(): Promise<typeof mongoose> {
    return await this.client.connect();
  }

  public disconnect(): void {
    return this.client.disconnect();
  }
}
