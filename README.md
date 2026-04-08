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
│       ├── pages/            # 页面目录
│       │   └── <page>/
│       │       ├── page.jsx
│       │       ├── components/
│       │       ├── configs/
│       │       ├── hooks/
│       │       └── utils/
│       ├── routes/           # 路由守卫
│       ├── router.jsx        # 路由定义
│       ├── services/         # 页面对应接口请求
│       ├── stores/           # Zustand 状态管理
│       └── styles/           # 全局样式
├── index.html
├── package.json
└── vite.config.js
```

## 前端目录约定

- `src/app/lib` 只放通用能力和工具函数，不放业务页面请求
- `src/app/services` 存放接口请求，并尽量与 `pages` 页面职责对齐
- `src/app/pages/<page>/page.jsx` 只负责页面编排
- `components/` 放页面内小组件、弹窗、搜索表单
- `configs/` 放表格列、静态配置
- `utils/` 放表单归一化、payload 构建、常量
- `hooks/` 放页面内专用 hooks

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

当前路由定义位于 [src/app/router.jsx](./src/app/router.jsx)。

主要页面包括：

- 登录
- 首页 Dashboard
- 用户 / 角色 / 菜单
- 会员 / 会员信息 / 会员等级 / 邀请明细 / 学习记录
- 订单 / 精品课程订单
- 教材 / 单元 / Part / 关卡 / 小关卡 / 大关卡 / 题目 / 素材
- 活动 / 精品课程 / 课程包 / 课程包课程 / 课程包活动 / 课程用户

项目同时保留了一部分旧地址别名路由，用于兼容旧后台跳转。

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
