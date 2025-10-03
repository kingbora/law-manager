import 'dotenv/config';
import { createApp, eventHandler, fromNodeMiddleware, toNodeListener, handleCors, defineEventHandler } from 'h3';
import { readdirSync, statSync } from 'node:fs';
import http from 'node:http';
import { join } from 'node:path';
import { authBasePath, authHandler } from './auth';

const app = createApp();

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// 处理CORS
const corsHandler = defineEventHandler((event) => {
  if (
    handleCors(event, {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposeHeaders: ['Set-Cookie'],
    })
  ) {
    return;
  }
});

app.use(corsHandler);

// simplistic auto route loader: maps src/api/<folder>/index.get.ts -> /<folder>
const apiRoot = join(process.cwd(), 'src', 'api');
for (const dir of readdirSync(apiRoot)) {
  const routeDir = join(apiRoot, dir);
  if (!statSync(routeDir).isDirectory()) continue;
  try {
    const mod = await import(join(routeDir, 'index.get.ts'));
    if (mod?.default) {
      app.use('/' + dir, mod.default);
    }
  } catch (_error) {
    // ignore if file not exists
  }
}

// 鉴权路由
app.use(authBasePath, fromNodeMiddleware(authHandler));

// root route
app.use(
  '/',
  eventHandler(() => ({ name: 'law-manager-server', status: 'ok' })),
);

const server = http.createServer(toNodeListener(app));
const port = process.env.PORT || 4000;
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
