import { Router } from 'express';
import type { Collection, Document } from 'mongodb';

export function createServiceRouter(
  services: Collection<Document>
): Router {
  const router = Router();

  router.get('/', async (_request, response) => {
    response.json(await services.find().toArray());
  });

  return router;
}
