# Backend API

## 说明

本文档记录当前后端接口、鉴权方式和返回约定。

## 基本约定

### Base URL

默认本地地址：

- `http://localhost:3000`

### 鉴权方式

- 登录接口：`POST /user/login`
- 登录成功后返回 JWT
- 其余后台接口通过请求头 `token` 传递令牌

### 返回结构

接口统一返回：

```json
{
  "code": 0,
  "message": "成功",
  "data": {}
}
```

约定：

- `code === 0` 表示成功
- `code !== 0` 表示失败
- 未授权类异常通常包装为 `code = 45`

### 异常处理

当前项目为了兼容旧后台，业务失败通常仍返回 HTTP `200`，真正的错误信息放在：

- `code`
- `message`

## Auth

### `POST /user/login`

说明：

- 用户登录

请求体：

```json
{
  "account": "admin",
  "password": "admin123456"
}
```

或：

```json
{
  "username": "admin",
  "password": "admin123456"
}
```

成功返回：

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "id": 1,
    "account": "admin",
    "username": "admin",
    "avatar": "",
    "roleId": 1,
    "token": "jwt-token"
  }
}
```

失败消息示例：

- `请输入用户名和密码`
- `用户名或密码错误`
- `账号已被禁用`

### `POST /user/logout`

说明：

- 前端退出登录占位接口

## Users

以下接口默认需要 `token`。

### `POST /user/list`

说明：

- 用户列表

请求体字段：

- `account`
- `startTime`
- `endTime`
- `pageNum`
- `pageSize`

### `POST /user/add`

说明：

- 新增后台用户

请求体字段：

- `account`
- `password`
- `email`
- `phone`
- `avatar`
- `status`
- `roleid`

### `POST /user/update`

说明：

- 更新后台用户

请求体字段：

- `id`
- `password`
- `email`
- `phone`
- `avatar`
- `status`
- `roleid`
- `name`
- `sex`

### `POST /user/delete`

说明：

- 删除后台用户

请求体：

```json
1
```

或：

```json
{
  "id": 1
}
```

### `POST /user/forbidden`

说明：

- 禁用后台用户

### `POST /user/using`

说明：

- 启用后台用户

### `POST /file/upload`

说明：

- 文件上传
- 使用 `multipart/form-data`
- 字段名为 `file`

## Access

### `POST /role/list`

说明：

- 角色列表

请求体可传：

- 字符串关键字
- 或 `{ keyword }`
- 或 `{ name }`

### `POST /role/add`

说明：

- 新增角色

请求体可传：

- 字符串角色名
- 或 `{ name }`
- 或 `{ rolename }`

### `POST /role/delete`

说明：

- 删除角色

请求体可传：

- 数字 ID
- 或 `{ id }`

### `GET /role/menus/:id`

说明：

- 获取指定角色菜单树

### `POST /role/setAuthority`

说明：

- 设置角色菜单权限

请求体：

```json
{
  "roleId": 1,
  "menuIds": [1, 2, 3]
}
```

### `POST /menu/list`

说明：

- 菜单列表

请求体字段：

- `menuName`
- `pageNum`
- `pageSize`

### `POST /menu/add`

说明：

- 新增菜单

### `POST /menu/update`

说明：

- 更新菜单

### `POST /menu/delete`

说明：

- 删除菜单

## Members

### `GET /member/level/list`

说明：

- 会员等级列表

### `GET /member/level/list/combox`

说明：

- 会员等级下拉选项

### `POST /member/level/add`

说明：

- 新增会员等级

### `POST /member/level/update`

说明：

- 更新会员等级

### `GET /member/level/delete/:userLevel`

说明：

- 删除会员等级

### `POST /member/all/list`

说明：

- 会员列表

请求体字段：

- `pageNum`
- `pageSize`
- `userLevelIds`
- `expireStartTime`
- `expireEndTime`
- `payStartTime`
- `payEndTime`
- `registerStartTime`
- `registerEndTime`
- `tutuNumber`
- `mobile`
- `sex`
- `hasSetPassword`
- `sortInvite`
- `sortUserId`

### `POST /member/list`

说明：

- 与 `member/all/list` 当前返回同一份会员列表数据

### `POST /member/feed/list`

说明：

- 会员反馈列表

请求体字段：

- `pageNum`
- `pageSize`
- `startTime`
- `endTime`
- `tutuNumber`
- `mobile`

### `GET /member/startup/:id`

说明：

- 启用会员

### `GET /member/forbidden/:id`

说明：

- 禁用会员

### `POST /member/vip/add`

说明：

- 开通会员

请求体字段：

- `userId`
- `userLevel`

## Orders

### `POST /order/list`

说明：

- 订单列表

请求体字段：

- `tutuNumber`
- `orderNo`
- `itemId`
- `payType`
- `orderStatus`
- `activityId`
- `textbookId`
- `pageNum`
- `pageSize`

### `GET /activity/list/combox`

说明：

- 活动下拉选项

### `POST /course/list/down`

说明：

- 课程下拉选项
