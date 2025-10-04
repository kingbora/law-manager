import listEndpoints from 'express-list-endpoints';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAppInstance } from '../../app-context';

type ExpressEndpoint = {
  path: string;
  methods: string[];
};

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const endpoints = listEndpoints(getAppInstance()).map((endpoint: ExpressEndpoint) => ({
    path: endpoint.path,
    methods: endpoint.methods,
  }));

  res.json({ endpoints });
});

export default router;
