# 律所管理系统

## 目录结构

```
law-manager/
├─ pnpm-workspace.yaml
├─ package.json (monorepo root scripts)
├─ projects/
│  ├─ web-project/ (Next.js + Ant Design)
│  ├─ mobile-project/ (Expo React Native)
│  └─ server-project/ (H3 server, 自动路由: src/api/<route>/index.get.ts)
└─ packages/
  └─ tsconfig/ (共享 TypeScript 配置)
```

## 快速开始

安装依赖 (需 Node >= 18.18):

```bash
pnpm install
```

启动开发：

```bash
pnpm dev:server   # 启动服务端 http://localhost:4000
pnpm dev:web      # 启动 Web 端 http://localhost:3000
pnpm dev:mobile   # 启动移动端 (Expo Dev Tools)
```

或并行启动全部：

```bash
pnpm dev
```

## 服务端自动路由说明

在 `projects/server-project/src/api` 下创建目录，如 `case`，并在目录内添加 `index.get.ts`、`index.post.ts` 等文件即可暴露对应的 HTTP 方法，如：

```
src/api/case/index.get.ts   -> GET /case
src/api/case/index.post.ts  -> POST /case
```

## 后续规划 (Roadmap)

- [ ] 认证与授权（手机号验证码登录）
- [ ] 案件数据模型与持久化（可选 Prisma + PostgreSQL）
- [ ] 通用错误处理与日志体系
- [ ] 统一 UI 设计规范与主题定制
- [ ] API 类型共享（可通过 packages 下增加 shared-types 包）

## 开发规范 (建议)

- 严格 TypeScript 严格模式
- 提交前运行：`pnpm lint`、`pnpm typecheck`
- 新增 API 时添加最小化单元测试（后续可引入 Vitest）

## 许可证

MIT
