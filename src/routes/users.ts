import { Router } from 'express';
import type { Collection, Document } from 'mongodb';

type UserDocument = Document & {
  email?: string;
};

export function createUserRouter(users: Collection<UserDocument>): Router {
  const router = Router();

  router.get('/', async (_request, response) => {
    response.json(await users.find().toArray());
  });

  router.get('/:email', async (request, response) => {
    const user = await users.findOne({ email: request.params.email });
    if (!user) {
      response.status(404).json({ message: 'User not found' });
      return;
    }
    response.json(user);
  });

  router.post('/', async (request, response) => {
    const user = request.body as UserDocument | undefined;
    if (!user || typeof user.email !== 'string' || !user.email.trim()) {
      response.status(400).json({ message: 'A valid email is required' });
      return;
    }

    const email = user.email.trim().toLowerCase();
    if (await users.findOne({ email })) {
      response.status(400).json({ message: 'User already exists' });
      return;
    }

    const now = new Date();
    const result = await users.insertOne({
      ...user,
      email,
      createdAt: now,
      updatedAt: now,
    });
    response.status(201).json(result);
  });

  return router;
}
