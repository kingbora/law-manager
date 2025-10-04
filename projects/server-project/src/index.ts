import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { readdirSync, statSync, existsSync } from 'node:fs';
import http from 'node:http';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { authBasePath, authHandler } from './auth';
import { setAppInstance } from './app-context';
import type { Request, Response } from 'express';

const app = express();
setAppInstance(app);

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : undefined,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  }),
);

// 鉴权路由
app.use(authBasePath, authHandler);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// simplistic auto route loader: maps src/api/<folder>/index.get.ts|index.ts -> /<folder>
const apiRoot = join(process.cwd(), 'src', 'api');
const routeEntryCandidates = ['index.ts', 'index.get.ts', 'index.js'];

if (existsSync(apiRoot)) {
  for (const dir of readdirSync(apiRoot)) {
    const routeDir = join(apiRoot, dir);
    if (!statSync(routeDir).isDirectory()) continue;

    let moduleLoaded = false;
    for (const candidate of routeEntryCandidates) {
      const modulePath = join(routeDir, candidate);
      if (!existsSync(modulePath)) continue;

      const mod = await import(pathToFileURL(modulePath).href);
      const router = mod?.default;

      if (router) {
        app.use('/' + dir, router);
        moduleLoaded = true;
      }

      break;
    }

    if (!moduleLoaded) {
      console.warn(`[routes] no route module found for ${dir}`);
    }
  }
} else {
  console.warn(`[routes] directory ${apiRoot} not found; skipping auto-loading.`);
}

// root route
app.get('/', (_req: Request, res: Response) => {
  res.json({ name: 'law-manager-server', status: 'ok' });
});

const server = http.createServer(app);
const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
