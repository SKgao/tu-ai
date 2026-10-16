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
- 其余后台接口通过请求头传递令牌，以下两种都支持：
  - `Authorization: Bearer <token>`（当前前端使用这种方式）
  - `token: <token>`
- 服务启动时必须配置 `JWT_SECRET`，未配置会直接启动失败（不再提供兜底默认值）

### 授权规则

除登录接口外，所有接口都先经过 `TokenAuthGuard` 做身份认证。在此之上，`RolesGuard` 负责授权：

- 标注了 `@SuperAdminOnly()` 的接口只有超级管理员可以访问，其余角色会收到 `code = 1`、`message = 没有权限执行该操作`
- 超级管理员角色 ID 由环境变量 `SUPER_ADMIN_ROLE_IDS` 配置（逗号分隔），默认 `1`
- 未标注的接口保持“登录即可访问”

当前受限（仅超级管理员）的接口：

| 模块 | 接口 |
| --- | --- |
| 用户 | `POST /user/list`、`POST /user/add`、`POST /user/update`、`POST /user/delete`、`POST /user/forbidden`、`POST /user/using` |
| 角色 | `POST /role/list`、`POST /role/add`、`POST /role/delete`、`GET /role/menus/:id`、`POST /role/setAuthority` |
| 菜单 | `POST /menu/list`、`POST /menu/add`、`POST /menu/update`、`POST /menu/delete` |

例外说明：

- `POST /file/upload` 被教材、单元等多个业务页面共用，因此只要求登录
- `POST /role/menus` 只返回当前登录角色自己的菜单，供前端构建导航使用，因此只要求登录

> 注意：业务接口（教材、会员、订单、活动、课程包、精品课程）目前仍为“登录即可访问”。
> 现有菜单数据（seed 中只有 7 条）覆盖不到全部 74 个接口，因此在菜单与接口完成对齐之前，
> 先不对这些接口做按菜单粒度的授权。

### 写操作约定

所有会改变数据的接口一律使用 `POST`，不再使用 `GET`（避免被浏览器预取、爬虫或 CSRF 触发）。

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

- `account`（必填）
- `password`（必填）
- `roleid`（必填，必须显式指定角色，缺失会返回“请选择角色”）
- `email`
- `phone`
- `avatar`
- `status`

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

### `POST /member/level/delete/:userLevel`

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

### `POST /member/startup/:id`

说明：

- 启用会员

### `POST /member/forbidden/:id`

说明：

- 禁用会员

### `POST /member/vip/add`

说明：

- 开通会员

请求体字段：

- `userId`
- `userLevel`

> ⚠️ 以下两个接口的请求体字段名叫 `userId`，但**实际传的是图图号（`tutuNumber`），不是 `Member.id`**。
> 前端跳转链接是 `/invite-count?userId=${member.tutuNumber}`，页面标题也显示「当前图图号」。
> 按 `Member.id` 实现会永远查不到数据。

### `POST /member/invite/list`

说明：

- 邀请明细：某会员邀请了谁

请求体：

- **裸数字**（`tutuNumber`），不是对象，例如 `7`

响应 `data`：`{ data: [...], totalCount }`，行字段：

- `tutuNumber` / `realName` / `icon` / `mobile` / `inviteTime`

> 前端读取路径是 `response.data.data.data`（信封 → data → data），实现时需保持该嵌套。

### `POST /member/pass/record`

说明：

- 学习记录（分页）

请求体字段：

- `userId`（**图图号**）
- `pageNum` / `pageSize`（可选）

响应 `data.data[]`：`textbookName` / `unitName` / `partName` / `sessionName` / `createdAt`
（四个名称是 join 出的展示字段，不落库；为空时返回空串）

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

### `POST /grade/version/delete/:id`

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

### `POST /book/version/delete/:id`

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

## Units

单元属于教材（`Course`），是教学层级 `教材 → 单元 → Part → 关卡` 的第一层。

### `POST /unit/list`

说明：

- 单元分页列表

请求体字段：

- `startTime`（可选，按创建时间筛选）
- `endTime`（可选）
- `textBookId`（可选，教材 ID）
- `pageNum`（可选，默认 1）
- `pageSize`（可选，默认 10）

响应 `data`：

- `data[]`：`id` / `text` / `icon` / `textBookId` / `textBookName` / `sort` / `canLock` / `status` / `createdAt`
- `totalCount` / `totalPages` / `pageNum` / `pageSize`

### `POST /unit/add`

说明：

- 新增单元

请求体字段：

- `text`（必填，单元名称）
- `textBookId`（必填，教材 ID）
- `icon`（可选）
- `sort`（可选，默认 0）

### `POST /unit/update`

说明：

- 更新单元

请求体字段：

- `id`（必填）
- `text` / `textBookId` / `icon` / `sort`（同 `/unit/add`）

> 该接口为全量更新：`text` 与 `textBookId` 必填。

### `POST /unit/del/:id`

说明：

- 删除单元（硬删除）

请求参数：

- 路径参数 `id`

### `POST /unit/lock`

说明：

- 锁定 / 解锁单元

请求参数（**query**）：

- `unitId`
- `canLock`（`1` = 已解锁，`2` = 已锁定）

## Parts

Part 属于单元（`Unit`），是教学层级 `教材 → 单元 → Part → 关卡` 的第三层。

### `POST /part/list`

说明：

- Part 分页列表

请求体字段：

- `unitId`（可选，按所属单元筛选；**注意是 `unitId`，与记录字段 `unitsId` 不同名**）
- `startTime` / `endTime`（可选）
- `pageNum` / `pageSize`（可选）

响应 `data.data[]`：`id` / `title` / `icon` / `tips` / `sort` / `canLock` / `unitsId` / `createdAt`

### `POST /part/add`

请求体字段：

- `title`（必填）
- `unitsId`（必填，所属单元 ID）
- `icon` / `tips` / `sort`（可选）

### `POST /part/update`

请求体字段：

- `id`（必填）
- `title` / `icon` / `tips` / `sort` / `canLock` / `unitsId`（**均为可选，传入即更新**）

> 该接口是**部分更新**语义：前端编辑提交会带全量字段，而「锁定/解锁」切换只传 `{ id, canLock }`。
> 未传的字段不会被清空。

### `POST /part/del/:id`

说明：

- 删除 Part（硬删除）

## Passes

关卡与小关卡**共用一张表**（`Pass`），靠外键区分：

- **关卡**（`/passes` 页）：`partsId` 有值，带 `subject`（题型）
- **小关卡**（`/custom-passes` 页）：`textbookId` 有值，带 `tmpTitle`，且 `id` 由客户端指定

### `GET /pass/list/:id` 与 `GET /pass/list`

说明：

- 关卡 / 小关卡分页列表

⚠️ **筛选维度由 query 决定，路径参数仅为兼容保留**：

- query 带 `partsId` → 按 Part 过滤（关卡）
- query 带 `textbookId` → 按教材过滤（小关卡）

两者都缺失时返回 `code = 1`、`message = 缺少 partsId 或 textbookId，无法确定关卡列表的筛选维度`，
**不会猜测维度返回可能错误的数据**。

说明：`partsId` 为空时前端会请求 `pass/list/`（尾斜杠、无路径参数），因此该路由同时注册了带参与非带参两种形态。

响应 `data.data[]` 为两者字段的**超集**：
`id` / `title` / `tmpTitle` / `icon` / `sort` / `partsId` / `textbookId` / `subject` / `customerNumber` / `totalScore` / `createdAt`
（`partsId` / `textbookId` / `subject` 为空时返回 `""`）

### `GET /pass/subject`

说明：

- **题型字典**（不是题目列表），供关卡的 `subject` 字段选择

响应结构为**双层 data**（前端读 `response.data.data.data`）：

```json
{ "code": 0, "message": "题型列表获取成功", "data": { "data": [ { "id": 1, "name": "题型名" } ] } }
```

> ⚠️ 数据源是 `SubjectType` 表，**当前未预置任何数据**（真实题型取值不在本仓库内）。
> 需要补齐数据后该接口才会返回可选项；在那之前关卡（`subject` 必填）无法新建。

### `POST /pass/add`

请求体字段（按形态二选一）：

- **关卡**：`title`(必填) / `partsId`(必填) / `subject`(必填) / `icon` / `sort`
- **小关卡**：`title`(必填) / `textbookId`(必填) / `id`(必填，客户端指定) / `tmpTitle` / `icon` / `sort`

> 同时传 `partsId` 与 `textbookId`（或都不传）会报 `必须且只能指定 partsId（关卡）或 textbookId（小关卡）其中之一`。

### `POST /pass/update`

请求体字段：`id`(必填) + 任意子集（`title` / `tmpTitle` / `icon` / `sort` / `subject` / `partsId` / `textbookId`），传入即更新。

### `POST /pass/delete`

说明：

- 小关卡页的删除形态，参数在 **query**：`?id=&textbookId=`
- 记录由 `id` 唯一确定，`textbookId` 仅为兼容前端既有调用而接收

### `POST /pass/delete/:id`

说明：

- 关卡页的删除形态，路径参数 `id`

## Sessions

大关卡直接挂在教材下，是小关卡的容器（`教材 → 大关卡 → 小关卡 → 题目`）。

### `GET /session/list/:textbookId`

说明：

- 取某教材下全部大关卡，返回**裸数组**（不是分页结构）

响应 `data[]`：`id` / `title` / `icon` / `status` / `sort` / `textbookId` / `createdAt`

### `POST /session/add`

请求体字段：

- `id`（必填，**由客户端指定**，`Session.id` 非自增）
- `textbookId`（必填）
- `title`（必填）
- `icon` / `sort`（可选）

> ID 已存在时返回 `大关卡 ID 已存在`。

### `POST /session/update`

请求体字段：`id`(必填) + `textbookId` / `title` / `icon` / `sort`（可选）

### `POST /session/delete/:id`

说明：

- 删除大关卡；同时清理其绑定行（显式事务，不依赖数据库级联）

### `POST /session/changeStatus`

说明：

- 启用 / 禁用大关卡

请求参数（**query**）：`id`、`status`（`1` = 启用，`2` = 禁用；其它值报错）

### `POST /session/bind`

说明：

- 绑定小关卡到大关卡

请求参数（**query**）：`textbookId`、`sessionId`、`customPassId`

> 重复绑定会明确报错（`该小关卡已绑定到此大关卡，请勿重复绑定`），不做静默幂等。
> 同时校验大关卡存在且归属该教材、小关卡存在。

### `POST /session/custom/list`

说明：

- 某大关卡已绑定的小关卡列表，返回**裸数组**

请求参数（**query**）：`textbookId`、`sessionId`

响应 `data[]`：`id`（**绑定行 id**，解绑/排序都用它）/ `customTitle`（小关卡标题）/ `title` / `icon` / `sort`（绑定顺序）/ `sessionId` / `customPassId`

### `POST /session/unbind/:id`

说明：

- 解绑；路径参数 `id` 是**绑定行 id**（即 `session/custom/list` 返回的 `id`）

### `POST /session/change/sort`

说明：

- 调整绑定顺序

请求参数（**query**）：`id`（绑定行 id）、`sort`

## Source Materials

素材挂在**教材**一级（`textbookId` → `Course.textbookId`），题目通过 `sourceIds` 引用。

### `POST /source/list`

请求体字段：

- `startTime` / `endTime` / `text`（可选）
- `openLike`（可选，**`1` = 精确匹配，缺省/其它 = 模糊匹配**；前端模糊搜索时该字段不会发送）
- `pageNum` / `pageSize`（可选）

> 该列表**不支持 `textbookId` 筛选**，是跨教材的全局素材库。

响应 `data.data[]`：`id` / `textbookId` / `text` / `icon` / `audio` / `translation` / `explainsArray` / `createdAt`

### `POST /source/add`

请求体字段：`textbookId`(必填) / `text`(必填) / `icon` / `audio` / `translation` / `explainsArray`

### `POST /source/update`

请求体字段：`id`(必填) + 任意子集（`text` / `icon` / `audio` / `translation` / `explainsArray`）

> **不接受 `textbookId`**：即使请求里带上也会被剥离，素材不可改挂教材。

### `POST /source/delete/:id`

说明：

- 删除单条素材

### `POST /source/delete/batch`

说明：

- 批量删除素材

请求体：**裸 JSON 数组**（`number[]`），不是对象

### `POST /source/audio/down/batch`

说明：

- 批量下载素材音频

请求体：**裸 JSON 数组**（`number[]`）

> ⚠️ **依赖外部服务**：需要配置 `SOURCE_AUDIO_DOWNLOAD_BASE_URL`，且调用协议尚未实现。

### `POST /test/send2line/source`

说明：

- 批量同步素材到外部系统 line（**不是单元测试接口**）

请求体：**裸 JSON 数组**（`number[]`）

> ⚠️ **依赖外部服务**：需要配置 `SEND2LINE_BASE_URL`，且调用协议尚未实现。

### `POST /subject/source/import`

说明：

- 题目-素材导入，**返回 HTML 字符串**（前端用 `dangerouslySetInnerHTML` 渲染）

请求体字段：`textbookId`(必填) / `audioArray` / `imageArray` / `sentensArray`
（三者是**文件名数组**，不是 URL；`sentensArray` 为原代码拼写）

> ⚠️ **依赖外部服务**：需要配置 `SUBJECT_SOURCE_IMPORT_BASE_URL`，且调用协议尚未实现。

> 以上三个外部依赖接口的当前行为：**未配置时报明确错误；已配置时也报错**（因为协议不在本仓库内，
> 既不猜测协议也不静默假装成功）。确认协议后即可在对应 service 方法内补实现。

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

### `POST /activity/delete/:id`

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

### `POST /bag/delete/:id`

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

### `POST /course/changeStatus`

说明：

- 更新课程包课程状态

请求参数：

- `id`
- `status`

### `POST /course/delete/:id`

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

### `POST /course/active/del/:id`

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

### `POST /special-course/delete/:textbookId`

说明：

- 删除精品课程

### `POST /special-course/up/:textbookId`

说明：

- 上架精品课程

### `POST /special-course/down/:textbookId`

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
