import { Router } from 'express';
import { ObjectId, type Collection, type Document } from 'mongodb';

type CartDocument = Document & {
  userEmail: string;
  userId: string;
  productId: string | number;
  quantity: number;
};

export function createCartRouter(cart: Collection<CartDocument>): Router {
  const router = Router();

  router.get('/:email', async (request, response) => {
    response.json(
      await cart.find({ userEmail: request.params.email }).toArray()
    );
  });

  router.post('/', async (request, response) => {
    const { userEmail, userId, productId, quantity = 1 } = request.body || {};
    if (
      typeof userEmail !== 'string' ||
      typeof userId !== 'string' ||
      (typeof productId !== 'string' && typeof productId !== 'number') ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      response.status(400).json({ message: 'Invalid cart item data' });
      return;
    }

    const existingItem = await cart.findOne({ userEmail, productId });
    if (existingItem) {
      await cart.updateOne(
        { _id: existingItem._id },
        { $inc: { quantity }, $set: { updatedAt: new Date() } }
      );
      const updatedItem = await cart.findOne({ _id: existingItem._id });
      response.json(updatedItem);
      return;
    }

    const now = new Date();
    const item: CartDocument = {
      userEmail,
      userId,
      productId,
      quantity,
      createdAt: now,
      updatedAt: now,
    };
    const result = await cart.insertOne(item);
    response.status(201).json(await cart.findOne({ _id: result.insertedId }));
  });

  router.patch('/:productId', async (request, response) => {
    const { quantity, userEmail } = request.body || {};
    const productId = Number(request.params.productId);
    if (typeof userEmail !== 'string' || !userEmail.trim()) {
      response.status(400).json({ message: 'userEmail is required' });
      return;
    }
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
      response.status(400).json({ message: 'Invalid product ID or quantity' });
      return;
    }

    const item = await cart.findOneAndUpdate(
      { userEmail, productId },
      { $set: { quantity, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!item) {
      response.status(404).json({ message: 'Cart item not found' });
      return;
    }
    response.json(item);
  });

  router.delete('/:id', async (request, response) => {
    if (!ObjectId.isValid(request.params.id)) {
      response.status(400).json({ message: 'Invalid cart item ID' });
      return;
    }

    const result = await cart.deleteOne({
      _id: new ObjectId(request.params.id),
    });
    if (result.deletedCount === 0) {
      response.status(404).json({ message: 'Cart item not found' });
      return;
    }
    response.json({ message: 'Item removed from cart successfully' });
  });

  return router;
}
