# 律所管理系统

## 工程描述

帮忙初始化一个工程，通过pnpm管理工程

- projects
  - web-project：用于PC端使用，基础技术栈nextjs、ant-design、typescript
  - mobile-project：用于移动端使用，基础技术栈为expo、nextjs、typescript
  - server-project：为上述前端应用提供服务的服务端，基础技术栈为H3，可通过在src下的api下通过文件夹名称自动定义路由

## 功能划分

- 通过手机

### 案件管理

- 案件立案与分配：记录案件基本信息，支持按类型、来源等分类，自动生成唯一编号。
- 进度跟踪：实时更新和查看案件处理状态，如立案、调查、庭审、结案等环节。
- 案件文档管理：集中存储和分类归档案件相关文件，如起诉书、证据材料、判决书等，支持上传、下载、版本控制。

### 客户管理

- 客户信息维护：记录客户基本资料、联系方式、案件历史等，支持信息检索和编辑。
- 客户沟通与跟进：内置沟通工具或日志，便于律师与客户联系和后续跟踪。

### 日程与任务管理

- 日程安排：为案件相关事件（如开庭、举证截止）设置提醒和任务分配。
- 任务分配与跟踪：向团队成员分配任务，设置截止日期，并跟踪完成进度。

### 费用与财务管理

- 费用管理：记录案件相关费用，如代理费、出费、账单生成，支持费用结构和支付状态的查询。
- 财务报表：自动生成财务统计报表，支持律所营收、支出、成本等数据的分析。

### 权限与安全管理

- 权限管理：根据角色（如律师、助理、客户）设置数据访问和操作权限，保障信息安全。
- 数据安全性：提供数据加密、登录验证和操作日志等功能，确保系统和案件数据安全。
- 登录注册：通过手机号验证码进行登录

## 统计与报表分析

- 案件统计分析：统计案件类型、数量、进展、律师工作量等，为律所管理和决策提供数据支持。

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
