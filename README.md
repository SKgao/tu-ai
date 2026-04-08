# TUTU-Admin

图图教育。

[![React](https://img.shields.io/badge/react-^16.2.0-brightgreen.svg?style=flat-square)](https://github.com/facebook/react)
[![Ant Design](https://img.shields.io/badge/ant--design-^3.2.2-yellowgreen.svg?style=flat-square)](https://github.com/ant-design/ant-design)
[![dva](https://img.shields.io/badge/dva-^2.1.0-orange.svg?style=flat-square)](https://github.com/dvajs/dva)

## 相关框架库
- [react](https://github.com/facebook/react) facebook的开源js框架
- react全家桶[redux](http://cn.redux.js.org/ ),[react-redux](https://cn.redux.js.org/docs/react-redux/),[redux-saga](https://redux-saga-in-chinese.js.org/docs/api/index.html),[react-router-^4.0.0](http://reacttraining.cn/),[Immutable](http://facebook.github.io/immutable-js/docs/)已集成至dva
- [ant-design](http://design.alipay.com/develop/web/docs/introduce)蚂蚁金服开发和服务于企业级后台产品
- [dva](https://github.com/dvajs/dva) 基于 redux、redux-saga 和 react-router 的轻量级前端框架[中文文档](https://github.com/dvajs/dva/blob/master/docs/API_zh-CN.md)
- 使用[roadhog](https://github.com/sorrycc/roadhog)本地调试和构建，其中Mock功能实现脱离后端独立开发（依赖nodejs 6.5+）


### 实现功能
- [x] 项目目录规划
- [x] 命令行生成页面对应的model、view、service文件等
- [x] 板块分目录、modal管理
- [x] 自适应适配不同分辨率
- [x] 引入echarts
- [x] 路由分块加载


## 开发构建

#### 目录结构
```bash
├── /dist/           # 项目输出目录
├── /public/         # 公共文件,编译时copy至dist目录
├── /src/            # 项目源码目录
│ ├── /assets/       # 图片资源
│ ├── /components/   # UI组件
│ ├── /configs/      # 工具函数
│ │ ├── layout.js    # 视图过滤配置,展示顶部或左侧等
│ │ └── pages.js     # 整个项目的路由配置
│ ├── /scss/         # 样式文件
│ ├── /pages/        # 视图、接口、样式、模型等文件
│ ├── /utils/        # 工具函数
│ │ ├── request.js   # 异步请求封装
│ │ └── jsonp.js     # jsonp服务
│ │ └── global.js    # 全局通用js方法
│ ├── index.js       # 入口文件
│ └── model.js       # 主model文件
│ └── router.js      # 路由入口
│ └── App.js         # 主view文件
├── package.json     # 项目信息
├── .eslintrc        # Eslint配置
└── .webpackrc       # 配置文件
└── .renderFile.js   # 批量生成目录文件配置
└── .webpack.config.js
```

#### 目录说明
- .webpackrc配置文件[参考配置](https://github.com/sorrycc/roadhog/blob/master/README_zh-cn.md)
- .roadhogrc.mock.js 模拟接口数据文件

## 快速开始

#### 安装依赖
```bash
$ npm install
```

#### 项目启动
```bash
$ npm start
打开 http://localhost:8888
```

#### 项目发布
```bash
$ npm build
```

#### 代码检测
```bash
npm run lint
```
