import { Router } from 'express';
import type { Collection, Document } from 'mongodb';

export function createOrderRouter(orders: Collection<Document>): Router {
  const router = Router();

  router.post('/', async (request, response) => {
    const order = request.body as Document;
    const products = order?.products;
    if (
      typeof order?.userEmail !== 'string' ||
      !order.userEmail.trim() ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      response.status(400).json({ message: 'Invalid order data' });
      return;
    }

    const now = new Date();
    const result = await orders.insertOne({
      ...order,
      createdAt: now,
      updatedAt: now,
    });
    response.status(201).json({ insertedId: result.insertedId });
  });

  router.get('/:email', async (request, response) => {
    const email = request.params.email;
    if (!email) {
      response.status(400).json({ message: 'Email is required' });
      return;
    }

    const userOrders = await orders
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();
    response.json(userOrders);
  });

  return router;
}
