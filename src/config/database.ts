import {
  MongoClient,
  ServerApiVersion,
  type Db,
} from 'mongodb';
import { environment } from './environment';

export const mongoClient = new MongoClient(environment.mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectToDatabase(): Promise<Db> {
  await mongoClient.connect();
  await mongoClient.db('admin').command({ ping: 1 });
  console.info('MongoDB connection established.');
  return mongoClient.db(environment.databaseName);
}
