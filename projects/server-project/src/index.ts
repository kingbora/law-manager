import { createApp, eventHandler, fromNodeMiddleware, toNodeListener } from 'h3';
import { readdirSync, statSync } from 'node:fs';
import http from 'node:http';
import { join } from 'node:path';
// eslint-disable-next-line import/no-unresolved
import { authBasePath, authHandler } from './auth';

const app = createApp();

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
  } catch (e) {
    // ignore if file not exists
  }
}

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
