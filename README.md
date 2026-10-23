# TUTU Admin

图图后台管理系统前端仓库。当前项目已经从旧版 `React + dva + roadhog + Ant Design 3` 迁移到新版 `React 18 + Vite + Ant Design 6 + Zustand`。

后端服务位于同仓库的 [backend](./backend) 目录，当前推荐以前后端一体仓方式开发。

## 当前技术栈

- `React 18`
- `Vite 8`
- `React Router 6`
- `Ant Design 6`
- `Zustand`
- `Axios`
- `Sass`

## 项目特性

- 页面按业务拆分到独立目录，页面相关组件、配置、表单转换逻辑就近放置
- 基于 `antd` 官方组件体系重写页面、表单、表格和弹窗
- 提供统一的列表页头部/工具条壳层组件
- 提供统一的表格远程请求、弹窗状态、上传状态 hooks
- Vite 手动拆包，按 `react`、`antd`、`data vendor` 等维度分 chunk
- 支持与本仓库内 NestJS 后端直接联调

## 仓库结构

```text
.
├── backend/                  # NestJS + Prisma + PostgreSQL 后端
├── public/                   # 静态资源
├── src/
│   ├── assets/               # 图片等资源
│   ├── main.jsx              # 前端入口
│   └── app/
│       ├── components/       # 通用组件
│       │   ├── forms/
│       │   └── page/
│       ├── hooks/            # 通用 hooks
│       ├── layouts/          # 布局
│       ├── lib/              # 工具函数/请求封装
│       ├── pages/            # 页面目录，按业务模块分组
│       │   ├── course/       # 课程模块
│       │   │   ├── special-courses/
│       │   │   ├── course-bags/
│       │   │   ├── course-bag-courses/
│       │   │   ├── course-bag-activities/
│       │   │   ├── activities/
│       │   │   └── course-users/
│       │   ├── member/       # 会员模块
│       │   ├── material/     # 教材模块
│       │   ├── order/        # 订单模块
│       │   ├── system/       # 系统模块
│       │   ├── dashboard/    # 工作台
│       │   └── login/        # 登录
│       ├── routes/           # 路由守卫
│       ├── router.tsx        # 路由定义
│       ├── services/         # 接口请求，目录与 pages 的业务模块一一对应
│       ├── stores/           # Zustand 状态管理
│       └── styles/           # 全局样式
├── index.html
├── package.json
└── vite.config.js
```

## 前端目录约定

- `src/app/lib` 只放通用能力和工具函数，不放业务页面请求
- `src/app/services/<module>` 存放接口请求，目录与 `pages/<module>` 一一对应
- `src/app/pages/<module>/<page>/page.tsx` 只负责页面编排
- `src/app/pages/<module>/<page>/components/` 放页面内小组件、弹窗、搜索表单
- `src/app/pages/<module>/<page>/configs/` 放表格列、静态配置
- `src/app/pages/<module>/<page>/utils/` 放表单归一化、payload 构建、常量
- `src/app/pages/<module>/<page>/hooks/` 放页面内专用 hooks
- 新增页面时必须落到对应业务模块目录，并同步在 `router.tsx` 中注册模块路由

## 开发环境

- Node.js: 建议 `18+`
- npm: 建议 `9+`
- 默认前端端口: `8888`
- 默认后端端口: `3000`

前端默认请求后端地址：

```text
http://localhost:3000/
```

如需覆盖，可在前端环境变量中设置：

```env
VITE_API_BASE_URL=http://localhost:3000/
```

## 快速开始

### 1. 安装前端依赖

```bash
npm install
```

### 2. 启动前端

```bash
npm run dev
```

访问：

```text
http://localhost:8888
```

### 3. 启动后端开发服务

在仓库根目录执行：

```bash
npm run dev:api
```

后端详细说明见 [backend/README.md](./backend/README.md)。

## 常用脚本

### 前端

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test
npm run verify
```

### 后端

```bash
npm run dev:api
npm run build:api
npm run start:api
```

## 构建

前端生产构建：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

## 路由与页面说明

当前路由定义位于 [src/app/router.tsx](./src/app/router.tsx)，按业务模块使用二级路径：

| 模块 | 路径前缀 | 页面 |
| --- | --- | --- |
| 工作台 | `/dashboard` | 工作台 |
| 课程模块 | `/course/*` | 精品课程、课程包管理、课程包课程、课程包活动、活动管理、课程用户 |
| 会员模块 | `/member/*` | 会员管理、会员信息、会员等级、邀请明细、学习记录 |
| 教材模块 | `/material/*` | 教材、单元、Part、关卡、小关卡、大关卡、题目、素材 |
| 订单模块 | `/order/*` | 订单管理、课程订单 |
| 系统模块 | `/system/*` | 用户、角色、菜单、迁移看板 |

项目同时保留了一部分旧地址别名路由（如 `/members`、`/courseBag/course`、`/subjects`），会在客户端重定向到对应新地址，并保留原查询参数，用于兼容旧后台跳转和书签。

## 菜单与用户授权

- 菜单数据存放在后端 `Menu` 表，菜单树定义在 [backend/prisma/menu-seed.ts](./backend/prisma/menu-seed.ts)；调整后可执行 `npm --prefix backend run db:sync-menus` 同步，不会清空业务数据。
- 左侧导航由 `POST /menu/my` 返回当前登录用户可见的菜单树，图标字段存的是 key，前端在 [src/app/lib/menuIcons.tsx](./src/app/lib/menuIcons.tsx) 中注册并渲染。
- 菜单管理页可以维护菜单名称、上级目录（`parentId`）、图标（`icon`）和排序值（`sortValue`），保存后侧边栏立即按新结构渲染。
- 用户管理页的「授权」使用 `UserMenu` 保存用户级菜单权限，授权树与左侧导航同源；只勾选子菜单时会自动补齐父级目录。
- 超级管理员角色（默认 `roleId = 1`）始终可见全部菜单；新建用户默认继承所属角色的菜单（`RoleMenu`），之后可以按用户单独调整。

## 异常页面与页面级访问控制

- 未知地址：访问系统中不存在的路由时自动跳转 `404` 页面，展示卡通插画、错误说明和原始访问地址，可返回首页或上一页。
- 无权限页面：直接输入没有菜单授权的页面地址时跳转 `403` 页面，提示联系管理员在「用户管理 → 授权」中开通对应菜单。
- 访问控制由 [RouteGuard.tsx](./src/app/routes/RouteGuard.tsx) 统一处理，路由与菜单的对应关系在 [menuAccess.ts](./src/app/lib/menuAccess.ts) 中维护。
- 课程包课程、课程包活动、邀请明细、学习记录等二级页面没有独立菜单，会继承入口页面的权限；新增页面时需要同步补充映射关系。
- 菜单加载失败时页面会放行，由侧边栏展示「重新加载」入口，避免网络异常把用户锁在 403 页面。

## 请求与鉴权

- 请求封装位于 [src/app/lib/http.js](./src/app/lib/http.js)
- 默认通过请求头 `token` 传递登录态
- 当后端返回业务码 `45` 或 `46` 时，会按登录失效处理并抛错

## UI 规范

- 全局 `antd` 组件默认尺寸统一为 `small`
- 列表页优先复用：
  - [PageHeaderCard.jsx](./src/app/components/page/PageHeaderCard.jsx)
  - [PageToolbarCard.jsx](./src/app/components/page/PageToolbarCard.jsx)
  - [SearchFormActions.jsx](./src/app/components/forms/SearchFormActions.jsx)
- 表单、弹窗、上传、列表查询尽量走统一 hooks：
  - `useRemoteTable`
  - `useFormModal`
  - `useUploadState`
  - `useMultiUploadState`

## 后端说明

后端位于 [backend](./backend)，技术栈为：

- `NestJS 11`
- `Prisma`
- `PostgreSQL`

后端初始化、数据库和种子数据说明见：

- [backend/README.md](./backend/README.md)
- [backend/API.md](./backend/API.md)

## 迁移说明

仓库已经完成旧版目录的大规模清理，当前默认以 `src/app` 作为唯一有效前端实现目录。后续新功能与重构都应基于这套目录继续推进，不再回到旧的 `src/pages` / `dva model` 架构。
