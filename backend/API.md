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

## Books

### `POST /grade/list`

说明：

- 年级列表

### `POST /grade/add`

说明：

- 新增年级

请求体可传：

- 字符串年级名
- 或 `{ name }`

### `POST /grade/update`

说明：

- 更新年级

请求体字段：

- `id`
- `gradeName`
- `status`

### `GET /grade/version/delete/:id`

说明：

- 删除年级

### `GET /book/version/list`

说明：

- 教材版本列表

### `POST /book/version/add`

说明：

- 新增教材版本

请求体可传：

- 字符串版本名
- 或 `{ name }`

### `POST /book/version/update`

说明：

- 更新教材版本

请求体字段：

- `id`
- `name`

### `GET /book/version/delete/:id`

说明：

- 删除教材版本

### `POST /book/list`

说明：

- 教材列表

请求体字段：

- `startTime`
- `endTime`
- `gradeId`
- `bookVersionId`
- `pageNum`
- `pageSize`

### `POST /book/add`

说明：

- 新增教材

请求体字段：

- `name`
- `icon`
- `gradeId`
- `bookVersionId`

### `POST /book/update`

说明：

- 更新教材

请求体字段：

- `id`
- `name`
- `icon`
- `gradeId`
- `bookVersionId`
- `status`

### `POST /book/delete`

说明：

- 删除教材

请求体可传：

- 数字 ID
- 或 `{ id }`

### `POST /book/lock`

说明：

- 更新教材锁定状态

请求参数：

- `textbookId`
- `canLock`

## Activities

### `POST /activity/list`

说明：

- 活动列表

请求体字段：

- `startTime`
- `endTime`
- `id`
- `pageNum`
- `pageSize`

### `GET /activity/list/combox`

说明：

- 活动下拉选项
- 仅返回启用中的活动

### `POST /activity/add`

说明：

- 新增活动

请求体字段：

- `title`
- `content`
- `icon`
- `activeMoney`
- `status`
- `activityType`
- `itemId`
- `activeExpireDays`
- `beginAt`
- `endAt`
- `url`

补充说明：

- `activityType = 1` 表示购买活动，必须传 `itemId`
- `itemId` 当前关联会员等级 `userLevel`

### `POST /activity/update`

说明：

- 更新活动

请求体字段：

- `id`
- 其余字段同 `activity/add`

### `GET /activity/delete/:id`

说明：

- 删除活动

### `POST /activity/change/status`

说明：

- 修改活动状态

请求体字段：

- `id`
- `status`

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

### `POST /course/order/list`

说明：

- 精品课程订单列表
- 当未传 `textbookId` 时，默认只返回 `textbookId` 不为空的订单

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

### `POST /course/list/down`

说明：

- 精品课程筛选下拉选项
- 当前返回 `SpecialCourse` 数据而非课程包课程

返回字段示例：

- `textbookId`
- `textbookName`
- `status`

补充说明：

- `payType = 1` 为微信
- `payType = 2` 为支付宝
- `payType = 3` 为后台开通

## Course Bags

### `GET /bag/list`

说明：

- 课程包列表
- 返回中包含课程包下的课程数组 `textBookDOS`

### `POST /bag/add`

说明：

- 新增课程包

请求体字段：

- `title`
- `icon`

### `POST /bag/update`

说明：

- 更新课程包

请求体字段：

- `id`
- `title`
- `icon`
- `sort`

### `POST /bag/changeStatus`

说明：

- 更新课程包状态

请求体字段：

- `id`
- `status`

### `GET /bag/delete/:id`

说明：

- 删除课程包

### `POST /course/add`

说明：

- 在课程包下新增课程

请求参数支持 query/body 混合，后端会合并处理。

请求字段：

- `bagId`
- `name`
- `icon`

### `POST /course/update`

说明：

- 更新课程包课程

请求参数支持 query/body 混合，后端会合并处理。

请求字段：

- `id`
- `name`
- `icon`
- `sort`

### `GET /course/changeStatus`

说明：

- 更新课程包课程状态

请求参数：

- `id`
- `status`

### `GET /course/delete/:id`

说明：

- 删除课程包课程

### `GET /course/active/list/:id`

说明：

- 查询指定课程包课程下的活动列表

### `POST /course/active/add`

说明：

- 新增课程包活动

请求体字段：

- `id`
- `textbookId`
- `teacher`
- `status`
- `type`
- `saleBeginAt`
- `saleEndAt`
- `beginAt`
- `endAt`
- `orgAmt`
- `amt`
- `num`
- `chatNo`
- `iconDetail`
- `iconTicket`

补充说明：

- `type = 1` 为统一开课，必须传 `beginAt` / `endAt`
- `type = 2`、`3` 时 `beginAt` / `endAt` 会被置空

### `POST /course/active/update`

说明：

- 更新课程包活动

请求体字段：

- `id`
- 其余字段同 `course/active/add`

### `GET /course/active/del/:id`

说明：

- 删除课程包活动

## Special Courses

### `POST /special-course/list`

说明：

- 精品课程列表

请求体字段：

- `startTime`
- `endTime`
- `pageNum`
- `pageSize`

### `GET /special-course/member/:userId`

说明：

- 查询指定会员已购买的精品课程列表
- `:userId` 同时兼容会员主键 `id` 和 `tutuNumber`
- 仅返回已支付订单对应的精品课程

### `POST /special-course/add`

说明：

- 新增精品课程

请求体字段：

- `textbookId`
- `textbookName`
- `teacher`
- `status`
- `type`
- `saleBeginAt`
- `saleEndAt`
- `beginAt`
- `endAt`
- `orgAmt`
- `amt`
- `num`
- `chatNo`
- `iconDetail`
- `iconTicket`

补充说明：

- `textbookId` 必须先存在于教材表 `Course`
- `type = 1` 为统一开课，必须传 `beginAt` / `endAt`
- `type = 2` 为购买生效，会忽略 `beginAt` / `endAt`
- `status = 1` 为上架，`status = 2` 为下架

### `POST /special-course/update`

说明：

- 更新精品课程

请求体字段：

- `textbookId`
- 其余字段同 `special-course/add`

### `GET /special-course/delete/:textbookId`

说明：

- 删除精品课程

### `GET /special-course/up/:textbookId`

说明：

- 上架精品课程

### `GET /special-course/down/:textbookId`

说明：

- 下架精品课程

### `POST /special-course/options`

说明：

- 精品课程下拉选项

返回字段示例：

- `textbookId`
- `textbookName`
- `status`

## Course Users

### `POST /course/user/list`

说明：

- 已买精品课程用户列表
- 数据来源为 `orderStatus = 2` 且 `textbookId` 不为空的订单

请求体字段：

- `textbookId`
- `tutuNumber`
- `mobile`
- `realName`
- `sex`
- `pageNum`
- `pageSize`

### `POST /course/user/add`

说明：

- 后台直接开通精品课程
- 若手机号已存在会员，则复用原会员并补充订单
- 若手机号不存在，则自动创建会员并生成已支付订单

请求体字段：

- `realName`
- `mobile`
- `sex`
- `payAmt`
- `textbookId`

补充说明：

- `payAmt` 单位为分
- 会生成 `payType = 3`、`orderStatus = 2` 的订单
- 同一会员重复开通同一精品课程会返回业务错误
