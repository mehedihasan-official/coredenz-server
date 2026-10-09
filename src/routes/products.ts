import { Router } from 'express';
import { ObjectId, type Collection, type Document } from 'mongodb';

export function createProductRouter(
  products: Collection<Document>
): Router {
  const router = Router();

  router.get('/', async (_request, response) => {
    response.json(await products.find().toArray());
  });

  router.get('/:id', async (request, response) => {
    const { id } = request.params;
    const numericId = /^\d+$/.test(id) ? Number(id) : undefined;
    const product = ObjectId.isValid(id)
      ? await products.findOne({ _id: new ObjectId(id) })
      : await products.findOne({
          $or: [
            { id },
            ...(numericId === undefined ? [] : [{ id: numericId }]),
          ],
        });
    if (!product) {
      response.status(404).json({ message: 'Product not found' });
      return;
    }
    response.json(product);
  });

  router.post('/', async (request, response) => {
    const product = request.body as Document;
    if (!product || typeof product !== 'object' || Array.isArray(product)) {
      response.status(400).json({ message: 'Product data must be an object' });
      return;
    }

    const now = new Date();
    const result = await products.insertOne({
      ...product,
      createdAt: now,
      updatedAt: now,
    });
    response.status(201).json(result);
  });

  return router;
}
