import cors from 'cors';
import express from 'express';
import type { Db } from 'mongodb';
import { environment } from './config/environment';
import { errorHandler } from './middleware/error-handler';
import { createCartRouter } from './routes/cart';
import { createOrderRouter } from './routes/orders';
import { createProductRouter } from './routes/products';
import { createServiceRouter } from './routes/services';
import { createUserRouter } from './routes/users';

export function createApp(database: Db) {
  const app = express();
  const allowedOrigins = new Set(environment.corsOrigins);

  app.disable('x-powered-by');
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_request, response) => {
    response.json({ name: 'CoreDenz API', status: 'running' });
  });
  app.get('/health', async (_request, response) => {
    await database.command({ ping: 1 });
    response.json({ status: 'ok', database: 'connected', time: new Date() });
  });

  app.use('/users', createUserRouter(database.collection('users')));
  app.use('/products', createProductRouter(database.collection('products')));
  app.use('/services', createServiceRouter(database.collection('services')));
  app.use('/cart', createCartRouter(database.collection('cartData')));
  app.use('/orders', createOrderRouter(database.collection('orders')));

  app.use((_request, response) => {
    response.status(404).json({ message: 'Route not found' });
  });
  app.use(errorHandler);

  return app;
}
