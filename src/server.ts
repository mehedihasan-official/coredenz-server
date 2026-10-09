import 'dotenv/config';
import { createApp } from './app';
import { connectToDatabase, mongoClient } from './config/database';
import { environment } from './config/environment';
import type { Request, Response } from 'express';

let appPromise: ReturnType<typeof createApplication> | undefined;

async function createApplication() {
  return createApp(await connectToDatabase());
}

function getApplication() {
  appPromise ??= createApplication();
  return appPromise;
}

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const app = await getApplication();
    app(request, response);
  } catch (error) {
    console.error('API initialization failed:', error);
    response.status(500).json({ message: 'Internal server error' });
  }
}

if (require.main === module) {
  void getApplication()
    .then(app => {
      const server = app.listen(environment.port, () => {
        console.info(`CoreDenz API listening on port ${environment.port}.`);
      });

    const shutdown = (signal: NodeJS.Signals) => {
      console.info(`Received ${signal}; closing the HTTP and database connections.`);
      server.close(error => {
        if (error) {
          console.error('Failed to close the HTTP server cleanly:', error);
          process.exitCode = 1;
        }
        void mongoClient.close().catch(databaseError => {
          console.error('Failed to close the MongoDB connection:', databaseError);
          process.exitCode = 1;
        });
      });
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    })
    .catch(async error => {
      console.error('API startup failed:', error);
      await mongoClient.close().catch(closeError => {
        console.error('Failed to close MongoDB after startup error:', closeError);
      });
      process.exitCode = 1;
    });
}
