# Tutu Admin Backend

## 项目说明

这是图图后台管理系统的后端服务，基于 `NestJS + Prisma + PostgreSQL` 实现。

当前后端目标很明确：

- 承接后台管理页面的数据接口
- 兼容旧后台接口风格
- 以轻量模块化结构支撑当前前端迁移阶段

接口相关内容已单独拆分到 [API.md](./API.md)。

## 技术栈

- `NestJS 11`
- `TypeScript 5`
- `Prisma`
- `PostgreSQL`
- `jsonwebtoken`
- `bcryptjs`
- `Docker Compose`

## 目录结构

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── common/
│   │   ├── parsers.ts
│   │   └── password.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── access/
│   │   ├── users/
│   │   ├── members/
│   │   └── orders/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── where.ts
│   ├── app.module.ts
│   └── main.ts
├── uploads/
├── docker-compose.yml
├── package.json
├── README.md
└── API.md
```

## 模块划分

- `auth`: 登录、JWT、鉴权守卫、异常兼容
- `access`: 角色、菜单、授权
- `users`: 后台用户和文件上传
- `members`: 会员、会员等级、会员反馈
- `orders`: 订单和相关选项数据

## 开发约定

- 业务代码按 `controller + service + module` 组织
- 数据访问统一通过 Prisma
- 公共参数解析放在 `src/common/parsers.ts`
- 公共查询条件拼装放在 `src/prisma/where.ts`
- 密码统一走 `src/common/password.ts`

## 环境准备

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

项目默认读取 `backend/.env`。

关键配置：

```env
DATABASE_URL=postgresql://tutu_admin:tutu_admin@localhost:5432/tutu_admin?schema=public
PORT=3000
JWT_SECRET=tutu-admin-local-secret
JWT_EXPIRES_IN=7d
DEFAULT_ADMIN_ACCOUNT=admin
DEFAULT_ADMIN_PASSWORD=admin123456
```

### 3. 启动数据库

```bash
npm run db:up
```

### 4. 初始化数据库

```bash
npm run db:setup
```

等价于：

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

## 启动方式

### 开发模式

```bash
npm run start:dev
```

### 构建

```bash
npm run build
```

### 生产启动

```bash
npm run start
```

默认服务地址：

- `http://localhost:3000`

## 常用脚本

```bash
npm run start:dev
npm run build
npm run typecheck
npm run test
npm run start
npm run db:up
npm run db:down
npm run prisma:generate
npm run db:push
npm run db:seed
npm run db:setup
```

## 默认种子账号

如果使用当前种子数据，默认管理员账号通常是：

- 账号：`admin`
- 密码：`admin123456`

如果配置了 `DEFAULT_ADMIN_ACCOUNT` 或 `DEFAULT_ADMIN_PASSWORD`，则以环境变量为准。
