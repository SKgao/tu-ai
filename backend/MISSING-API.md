# 待实现接口与模型清单

> ## ✅ 实现状态（已落地）
>
> 本清单中的 **50 个接口已全部实现**，本文档继续作为**字段契约与决策记录**保留。
>
> **三个决策点已按下列方案落地**（用户拍板）：
>
> | 决策 | 选定方案 |
> | --- | --- |
> | 「关卡 / 小关卡」表结构 | **单表**：一个 `Pass` 模型，`partsId` / `textbookId` 均可空（§3.3 方案 B） |
> | `pass/list/:id` 语义歧义 | **后端按 query 分流**（有 `partsId` 按 Part 过滤，有 `textbookId` 按教材过滤），URL 不变；两者都缺失时明确报错，不猜维度 |
> | 外部依赖接口 | **配置探测**：读环境变量，未配置（或已配置但协议未实现）时返回明确错误，不静默假装成功 |
>
> **新增模型**（`prisma/schema.prisma`）：`Unit`、`Part`、`Pass`、`Session`、`SessionCustomPass`、`Subject`、`SubjectMaterial`→`SourceMaterial`、`MemberInvite`、`LearningRecord`、`SubjectType`；
> 并在 `Course` 上补 `units/passes/sessions/sourceMaterials/learningRecords` 反向关系、在 `Member` 上补 `invitesSent/invitesReceived/learningRecords`、在 `Unit`/`Part`/`Session` 上补 `learningRecords`。
>
> **新增模块**：`modules/units`、`modules/parts`、`modules/passes`、`modules/sessions`、`modules/subjects`、`modules/source-materials`，并在 `modules/members` 内补邀请明细与学习记录。
>
> **§1.4 的前端解包 bug 已修复**（`services/custom-passes.ts`、`services/sessions.ts` 的 `listCustomPasses`）。
>
> **仍待人工处理的两件事**：
> 1. `SubjectType` 表**未预置数据**（真实题型取值不在本仓库内）→ 数据补齐前 `pass/subject` 返回空列表，关卡因题型必填而无法新建；
> 2. 三个外部依赖接口（`test/send2line/source`、`source/audio/down/batch`、`subject/source/import`）**只实现了配置探测与明确报错**，协议确认后需补具体调用。

> 本文档记录**前端已调用、但后端尚未实现**的接口，以及实现它们所需的 Prisma 模型。
> 由 `scripts/audit-missing-api.mjs` 自动核对生成，可用 `scripts/verify-missing-api-doc.mjs` 复核本文档是否与代码一致。

## 0. 结论速览

| 指标 | 数量 |
| --- | --- |
| 缺失接口 | **50 个** |
| 受影响页面 | **9 个**（占全部 27 个页面的 1/3） |
| 受影响 service | 9 个 |
| 需要新增的 Prisma 模型 | **9 个**（另有 2 个可选、1 个可改为扩展现有模型） |
| 需要改动的现有模型 | 2 处（`Member` 增加邀请关系；`Course` 增加反向关系） |
| 附带发现的前端缺陷 | **1 类**（service 解包层级错误，影响 2 个页面） |

**三个必须先拍板的决策点**（详见第 3 节）：

1. `pass/list/:id` 被三个页面复用，但路径参数**语义不同**（一处是 `partsId`，两处是 `textbookId`）。
2. 系统里存在**两条并行的层级链**，不是一条。
3. 「关卡 / 小关卡」是否沿用旧后端**共用一张表**的设计。

> ⚠️ 另外还有一个**独立的前端缺陷**：即使后端全部补齐，小关卡、大关卡两个页面**仍然拿不到数据**（service 解包层级错误，详见第 1.4 节）。

---

## 1. 这份清单要解决的问题

### 1.1 现象

这 9 个页面打开后**必然报错**，且错误信息是英文的，例如：

```
Cannot POST /unit/list
Cannot POST /part/list
Cannot POST /source/list
```

### 1.2 为什么错误信息长这样

[Nest 的 404 被全局异常过滤器改写成了 HTTP 200](../backend/src/modules/auth/legacy-api-exception.filter.ts)：

```ts
// legacy-api-exception.filter.ts:16-20
response.status(HttpStatus.OK).json({
  code: status === HttpStatus.UNAUTHORIZED ? 45 : 1,
  message: Array.isArray(message) ? message[0] : message || '请求失败',
  data: null,
});
```

路由不存在时 Nest 抛出 `NotFoundException('Cannot POST /unit/list')`，被这段代码包装成 `HTTP 200 + code:1`，
前端拦截器见 `code !== 0` 便抛出该英文消息 → 用户看到 `Cannot POST /unit/list`。

**副作用**：这个问题在日志/监控里**不会表现为 4xx/5xx**，只会表现为一堆业务错误，很容易被忽略。

### 1.3 核对方法

- `scripts/audit-missing-api.mjs`：提取全部后端路由 stem，与前端 10 个 service 的 114 个调用点逐一比对，输出缺失项。
- `scripts/verify-missing-api-doc.mjs <本文档>`：反向校验本文档中每个接口都「前端确有调用」且「后端确未实现」，防止文档与代码脱节。

### 1.4 🪤 另一个独立缺陷：补完后端，这 2 个页面**仍然拿不到数据**

**只实现后端是不够的。** `listCustomPasses` 这个函数在**两个 service 里各写了一份，且两份都多包了一层**：

```ts
// services/custom-passes.ts:9-14 与 services/sessions.ts:4-9 —— 返回的是「信封」，不是内层 data
export async function listCustomPasses(...): Promise<ApiEnvelope<ApiListResult>> {
  const response = await http.get<ApiEnvelope<ApiListResult>>(`pass/list/${payload.textbookId}`, ...);
  return response.data || {};        // ← 返回 { code, message, data: { data: [...], totalCount } }
}
```

而消费方按「内层 data」解包，于是拿到的是一个**对象**而不是数组：

| 消费方 | 代码 | 实际拿到 | 结果 |
| --- | --- | --- | --- |
| 小关卡列表 | `custom-passes/page.jsx:78` `getItems: (r) => r?.data` | `{data:[...],totalCount}` 对象 | `useRemoteTable` 的 `Array.isArray` 判定失败 → **列表恒为空** |
| 小关卡总数 | `custom-passes/page.jsx:79` `getTotalCount: (r) => r?.totalCount` | `undefined` | **总数恒为 0** |
| 大关卡「绑定小关卡」候选 | `sessions/page.jsx:78` `customPassData?.data` | 对象 | **候选恒为空 → 无法绑定** |

对照：其它 5 个 service（units、parts、passes、subjects、source-material）都返回 `response.data?.data`，消费方 `result?.data` 因此正确。
`sessions.ts` 里另外两个函数（`listSessions:13`、`listSessionCustomPasses:59`）也返回内层 data，消费正确 —— **只有 `listCustomPasses` 这一个是错的**（且错了两份）。

**修复方式**（二选一，建议前者以对齐全仓约定）：

```ts
// 方案 A：改 service（与其它 5 个 service 一致）
export async function listCustomPasses(...): Promise<ApiListResult> {
  const response = await http.get<ApiEnvelope<ApiListResult>>(...);
  return response.data?.data || {};
}
// 方案 B：改消费方 → result?.data?.data
```

> 这类问题**不会被类型检查发现**：`ApiEnvelope<ApiListResult>` 的类型标注与实现是自洽的，只有对照消费方才能看出契约错位。

---

## 2. 总览表

| 页面 | 路由 | service | 缺失接口 | 前端语言 | 需要的新模型 |
| --- | --- | --- | --- | --- | --- |
| 单元管理 | `/units` | `units.ts` | 5 | TS | `Unit` |
| Part 管理 | `/parts` | `parts.ts` | 4 | JS | `Part` |
| 关卡管理 | `/passes` | `passes.ts` | 5 | TS | `Pass` |
| 小关卡管理 | `/custom-passes` | `custom-passes.ts` | 6 | JS | `CustomPass` |
| 大关卡管理 | `/sessions` | `sessions.ts` | 10 | JS | `Session`、`SessionCustomPass` |
| 题目管理 | `/subjects` | `subjects.ts` | 10 | TS | `Subject` |
| 素材管理 | `/source-material` | `source-material.ts` | 8 | TS | `SourceMaterial` |
| 邀请明细 | `/invite-count` | `invite-count.ts` | 1 | TS | `MemberInvite`（或改 `Member`） |
| 学习记录 | `/learning-record` | `learning-record.ts` | 1 | TS | `LearningRecord` |
| **合计** | | | **50** | | **9**（+2 可选） |

> 已实现的 74 个接口不受影响，[API.md](./API.md) 已完整记录。

---

## 3. ⚠️ 动手前必须先定的事

### 3.1 `pass/list/:id` 的路径参数语义冲突（最高优先级）

同一个路径被三个页面调用，但 `:id` 的含义**完全不同**：

| 调用方 | 代码 | `:id` 实际含义 |
| --- | --- | --- |
| 关卡管理 | [passes.ts:10](../src/app/services/passes.ts) `` `pass/list/${payload.partsId ?? ''}` `` | **partsId**（Part 下所有关卡） |
| 小关卡管理 | [custom-passes.ts:10](../src/app/services/custom-passes.ts) `` `pass/list/${payload.textbookId}` `` | **textbookId**（教材下所有小关卡） |
| 大关卡管理 | [sessions.ts:5](../src/app/services/sessions.ts) `` `pass/list/${payload.textbookId}` `` | **textbookId**（同上，用于下拉候选） |

旧实现同样是这种用法（见 3.4 节恢复出来的 `service.js`），说明这是**历史遗留设计**而非新前端的失误。

**必须在开发前决定**（三选一）：

1. 后端按「是否同时带 `partsId` query」来分支；
2. 拆分路由（如 `pass/list/by-part/:partsId` 与 `pass/list/by-textbook/:textbookId`），前端同步改；
3. 统一成 `pass/list` + query 参数，废弃路径参数。

> 建议 **方案 2 或 3**。方案 1 依赖调用方「恰好」少传/多传某个参数，非常脆弱。

### 3.2 系统有两条并行的层级链，不是一条

这是理解全部 9 个页面的关键：

```text
链 A（教学内容）
教材 Course ──→ 单元 Unit ──→ Part ──→ 关卡 Pass

链 B（练习/闯关）
教材 Course ──→ 大关卡 Session ──→ 小关卡 CustomPass ──→ 题目 Subject
                                          ↑
                                    素材 SourceMaterial（挂在教材下，题目通过 sourceIds 引用）
```

证据：

| 结论 | 证据 |
| --- | --- |
| Unit 挂教材 | `UnitRecord.textBookId` / `textBookName`（[units/types.ts](../src/app/pages/units/types.ts)） |
| Part 挂 Unit | 表单字段 `unitsId`（`parts/components/PartModal.jsx:54`），旧 `part/model.js` 同名字段 |
| Pass 挂 Part | `PassRecord.partsId`（[passes/types.ts](../src/app/pages/passes/types.ts)），旧 `pass/model.js` state 只有 `partsId` |
| Session 挂教材 | `session/add` 提交 `textbookId`（`sessions/page.jsx:115`），旧 `session/model.js` state 只有 `textbookId` |
| Session 绑定 CustomPass | `session/bind?textbookId=&sessionId=&customPassId=`（[sessions.ts:45](../src/app/services/sessions.ts)） |
| Subject 挂 CustomPass | `SubjectRecord.customsPassId` / `customsPassName`（[subjects/types.ts](../src/app/pages/subjects/types.ts)） |
| 两条链的字段集不同 | Pass 有 `customerNumber`(闯关人数)/`totalScore`(平均分)/`subject`(题型)；Session 只有 `title/icon/status/sort` |

⚠️ **命名陷阱**：标题文案与字段名不一致，容易看错层级——

- 关卡页列 `sessionName` 却叫「关卡名称」（[learning-record/configs/tableColumns.tsx:9](../src/app/pages/learning-record/configs/tableColumns.tsx)）
- 题目页列 `customsPassName` 也叫「关卡名称」（`subjects/configs/tableColumns.tsx`）
- 「小关卡」的表单字段是 `customsPassId`（带 s），而「Part」的字段是 `unitsId`（也带 s）

### 3.3 「关卡 / 小关卡」是否共用一张表

旧后端把 `pass/add`、`pass/update`、`pass/list`、`pass/delete` 同时用于**关卡**和**小关卡**，靠传入 `partsId` 还是 `textbookId` 区分。
两种建模方式各有道理，**这是本清单里最难自行决定的一点**：

**方案 A：拆成两张表**（本文档第 4 节采用的写法）

- `Pass`（挂 Part，有 `customerNumber`/`totalScore`/`subject`）
- `CustomPass`（挂教材，有 `tmpTitle`）

本清单按此方案书写，因为两者字段差异明显，且语义最清晰。

**方案 B：合并为一张表**（旧后端做法，分析中置信度约 0.7）

支持合并的关键证据是**两页共享同一个 id 空间**：

| 证据 | 说明 |
| --- | --- |
| 两页都把自身行的 `id` 当作题目的 `customsPassId` | `passes/configs/tableColumns.tsx:46` 与 `custom-passes/configs/tableColumns.jsx:42` 都跳转 `/subjects?customsPassId=<行id>` |
| 题目侧只有一个关联字段 | `Subject.customsPassName`（[subjects/types.ts](../src/app/pages/subjects/types.ts)），没有类型/来源标识 |
| 前端不传任何 type/level/parentId | 全目录无此类字段，唯一的区分依据是请求里的 `partsId` vs `textbookId` |
| 存在全局 pass id 常量 | `subjects/utils/forms.ts:27` 用 `'2' || '8'` 判断场景图关卡 |

若拆成两张表，`Subject.customsPassId` 会产生**指向歧义**（无法判断指向哪张表），需要额外加一个来源类型字段——而前端并不传该字段。

**建议**：先确认旧库 `pass` 表的实际结构（是否 `parts_id` 与 `textbook_id` 都可空），再定方案。
若无法确认，**方案 B（单表 + 两个可空外键）对现有前端契约的兼容性更好**，代价是表语义偏杂。

> 无论选哪个，3.1 的路径歧义都必须先解决。

### 3.4 💡 旧实现可从 git 历史完整恢复（强烈建议先看）

旧后台的前端代码在提交 `340ae05` 中被删除，但**仍在 git 历史里**，可直接取用作为字段契约的权威参考：

```bash
# 单元
git show 340ae05^:src/pages/teachingManage/unit/service.js
git show 340ae05^:src/pages/teachingManage/unit/model.js
# part / pass / customPass / session
git show 340ae05^:src/pages/teachingManage/{part,pass,customPass,session}/{service,model,index}.js
# 题目 / 素材 / 邀请明细 / 学习记录
git show 340ae05^:src/pages/subjects/service.js
git show 340ae05^:src/pages/sourceMaterial/service.js
git show 340ae05^:src/pages/inviteCount/service.js
git show 340ae05^:src/pages/learningRecord/service.js
```

这些文件给出了**原始请求字段名与参数位置**，比从新前端反推更可靠。已用它们交叉验证了本文档的字段。

旧实现还包含**新前端未迁移的接口**，实现时可按需一并考虑：

| 旧接口 | 用途 | 新前端是否调用 |
| --- | --- | --- |
| `test/send2line/unit/${id}` | 同步单元 | ✗ 未迁移 |
| `subject/subject/desc?customsPassId=&sort=` | 题目详情（另一形态） | ✗ 未迁移 |
| `subject/subject/import` | 题目导入 | ✗ 未迁移 |

---

## 4. 分页面明细

> 字段来源标注：`types.ts` = 页面类型定义；`forms.js` = 表单初值；`tableColumns` = 表格列；`page.jsx/tsx` = 提交处。
> 「置信度」仅用于建议模型部分。

### 4.1 单元管理 `/units` — 5 个接口

**接口**

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | `unit/list` | 单元分页列表 |
| POST | `unit/add` | 新增单元 |
| POST | `unit/update` | 更新单元 |
| GET | `unit/del/:id` | 删除单元（建议改 POST） |
| POST | `unit/lock?unitId=&canLock=` | 锁定/解锁 |

**请求字段**（[units/types.ts](../src/app/pages/units/types.ts)）

| 接口 | 字段 | 类型 |
| --- | --- | --- |
| `unit/list` | `startTime` `endTime` `textBookId` `pageNum` `pageSize` | string / string / **string** / number / number |
| `unit/add` `unit/update` | `text`(必填) `icon` `textBookId` `sort`；更新另带 `id` | string / string / number / number / number |
| `unit/lock` | `unitId` `canLock` | number / number |

> ⚠️ **`textBookId` 的类型在请求里不统一**：列表查询传的是**字符串**（下拉 `value: String(item.id)`，`units/components/UnitSearchForm.tsx:52`），
> 而新增/更新传的是 `Number()` 转换后的数字（`units/page.tsx:178`）。DTO 需两者都接
> （现有后端依赖 `main.ts` 的 `enableImplicitConversion: true` 才能隐式转换，与 `ListBooksDto.gradeId` 同风险）。

> ⚠️ `unit/lock` 同时把参数放在 **query 和 body** 各发一份（`services/units.ts:29-33`）。后端只读 query 即可
> （与 `book/lock` 的 `@Query()` 写法一致），避免 `whitelist` DTO 因 body 校验报错。

**响应字段**（`UnitRecord` + `tableColumns`）

| 字段 | 含义 |
| --- | --- |
| `id` | 主键 |
| `text` | 单元名 |
| `icon` | 封面图 URL |
| `textBookId` / `textBookName` | 所属教材 ID / 名称（列表展示用） |
| `sort` | 排序 |
| `canLock` | 锁定状态（`1`=已解锁，其它=锁定） |
| `createdAt` | 创建时间 |

**建议模型**

```prisma
model Unit {
  id        Int      @id @default(autoincrement())
  text      String
  icon      String?  @default("")
  sortValue Int      @default(0)          // API 出参名 sort
  canLock   Int      @default(1)          // 1=已解锁
  textbookId Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  course    Course   @relation(fields: [textbookId], references: [textbookId], onDelete: Cascade)
  parts     Part[]

  @@index([textbookId])
  @@index([sortValue])
}
```

> 注意：`textBookId`（请求/响应）与 `textbookId`（Prisma 惯例，参照 `Course.textbookId`）大小写不同，需在 service 层做映射。

---

### 4.2 Part 管理 `/parts` — 4 个接口

**接口**：`part/list`(POST)、`part/add`(POST)、`part/update`(POST)、`part/del/:id`(GET)

**请求字段**

| 接口 | 字段 | 来源 |
| --- | --- | --- |
| `part/list` | `unitId`(注意不是 `unitsId`) `pageNum` `pageSize` | `parts/page.jsx:58-60` |
| `part/add` | `title` `icon` `unitsId` `tips` `sort` | `parts/page.jsx:91-95` |
| `part/update` | 同上 + `id` + `canLock` | `parts/page.jsx:104-106` |

**响应字段**：`id`、`title`(Part 名称)、`icon`、`tips`(描述)、`sort`、`canLock`、`unitsId`

**⚠️ 命名冲突**：列表过滤用 `unitId`，而记录/提交用 `unitsId`。建议 DTO 同时接受两者并归一到 `unitsId`。

**建议模型**

```prisma
model Part {
  id        Int      @id @default(autoincrement())
  title     String
  icon      String?  @default("")
  tips      String?  @default("")
  sortValue Int      @default(0)
  canLock   Int      @default(1)
  unitsId   Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  unit      Unit     @relation(fields: [unitsId], references: [id], onDelete: Cascade)
  passes    Pass[]

  @@index([unitsId])
  @@index([sortValue])
}
```

---

### 4.3 关卡管理 `/passes` — 5 个接口

**接口**：`pass/add`(POST)、`pass/list/:partsId`(GET)、`pass/update`(POST)、`pass/delete/:id`(GET)、`pass/subject`(GET)

**请求字段**（[passes/types.ts](../src/app/pages/passes/types.ts)）

| 接口 | 字段 |
| --- | --- |
| `pass/list/:partsId` | 路径 `partsId`；query `partsId` `pageNum` `pageSize` |
| `pass/add` / `pass/update` | `title`(必填) `icon` `partsId` `sort` `subject`(题型)；更新另带 `id` |

**响应字段**（`PassRecord`）：`id`、`title`(关卡标题)、`icon`、`customerNumber`(闯关人数)、`sort`(关卡顺序)、`totalScore`(平均分)、`createdAt`、`partsId`、`subject`

**建议模型**

```prisma
model Pass {
  id             Int      @id @default(autoincrement())
  title          String
  icon           String?  @default("")
  partsId        Int
  sortValue      Int      @default(0)
  subject        Int?                        // 题型，来自 pass/subject 选项
  customerNumber Int      @default(0)        // 闯关人数（统计字段）
  totalScore     Int      @default(0)        // 平均分（统计字段）
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  part           Part     @relation(fields: [partsId], references: [id], onDelete: Cascade)

  @@index([partsId])
  @@index([sortValue])
}
```

> `customerNumber` / `totalScore` 是**统计值**，需确认是由答题流水聚合而来，还是直接落库的冗余字段。

> ⚠️ **`pass/delete` 存在两种路由形态，必须都注册**：本页用路径参数 `pass/delete/:id`（[passes.ts:22](../src/app/services/passes.ts)），
> 而小关卡页用 query `pass/delete?id=&textbookId=`（[custom-passes.ts:27-29](../src/app/services/custom-passes.ts)）。Nest 中两者不冲突。

> ⚠️ `partsId` 为空时前端会发出 `pass/list/`（尾斜杠、无参数，见 [passes.ts:10](../src/app/services/passes.ts) `?? ''`）——后端需明确此时是返回全部还是空列表。

> ⚠️ **`pass/subject` 是「题型」字典，不是「题目」列表。** 证据：字段标签为「题型」（`passes/components/PassModal.tsx:78`、
> `subjects/components/SubjectModal.tsx:81`、`custom-passes/components/TopicModal.jsx:54`），错误文案为「题型列表加载失败」（`passes/page.tsx:96`），
> 旧实现注释同样是「题型列表」。它只用来给 `Pass.subject` 提供可选值，**不要**误解为题目实体。
> 返回结构为**双层 data**：前端读 `response.data.data.data`（[passes.ts:27](../src/app/services/passes.ts)），元素为 `{id, name}`（`PassSubjectOption`）。实现时注意包一层。
> 取值集合本身（枚举还是数据表）无从确认，见存疑清单。

---

### 4.4 小关卡管理 `/custom-passes` — 6 个接口

**接口**：`pass/subject`(GET)、`pass/list/:textbookId`(GET)、`pass/add`(POST)、`pass/update`(POST)、`pass/delete`(GET，参数走 query)、`subject/add/one`(POST)

**请求字段**（[custom-passes/utils/forms.js](../src/app/pages/custom-passes/utils/forms.js)）

| 接口 | 字段 |
| --- | --- |
| `pass/add` / `pass/update` | `textbookId` `title` `tmpTitle`(过渡标题) `icon` `sort`；更新另带 `id` |
| `pass/delete` | `id` `textbookId`（**query 参数，非路径**） |
| `subject/add/one` | `customsPassId` `sourceIds` `sort` `showIndex`(**string[]**) `icon` `audio` `sceneGraph` `sentenceAudio` `subject`；另有来自 URL 的 `partId` `sessionId` |

> `EMPTY_TOPIC_FORM` 就是「单题录入」的表单，与题目页字段基本重合。

**三个容易踩的坑**

1. **`id` 由客户端指定**：小关卡新增时必须传 `id`（`custom-passes/page.jsx:120,129`），而关卡新增**不传** `id`（`passes/page.tsx:133-139`）。
   若两页共用一张表，主键生成策略必须同时支持「显式 id 插入」与「自增」。
2. **`partId` 与 `partsId` 不是同一个拼写**：`subject/add/one` 用 `partId`（`page.jsx:182`），`pass/add` 用 `partsId`（`passes/page.tsx:136`）。DTO 不能合并，两个都要接。
3. **`showIndex` 提交的是数组**：前端把表单里的字符串按空白切分成 `string[]`（`page.jsx:186`）。

**响应字段**：`id`(小关卡 ID)、`title`、`tmpTitle`、`icon`、`sort`、`createdAt`

**建议模型**

```prisma
model CustomPass {
  id         Int      @id                 // 客户端提交，非自增（旧实现同）
  textbookId Int
  title      String
  tmpTitle   String?  @default("")        // 过渡标题
  icon       String?  @default("")
  sortValue  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  course     Course   @relation(fields: [textbookId], references: [textbookId], onDelete: Cascade)
  subjects   Subject[]
  bindings   SessionCustomPass[]

  @@index([textbookId])
  @@index([sortValue])
}
```

---

### 4.5 大关卡管理 `/sessions` — 10 个接口

**接口**

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/session/list/{textbookId}` | 大关卡列表（**返回裸数组，非分页**） |
| POST | `session/add` | 新增大关卡 |
| POST | `session/update` | 编辑大关卡 |
| GET | `/session/delete/{id}` | 删除大关卡 |
| POST | `session/changeStatus?id=&status=` | 启停（1↔2） |
| POST | `session/bind?textbookId=&sessionId=&customPassId=` | 绑定小关卡 |
| POST | `session/custom/list?textbookId=&sessionId=` | 已绑定小关卡列表（裸数组） |
| GET | `session/unbind/{id}` | 解绑（`id` = **绑定行 id**） |
| POST | `session/change/sort?id=&sort=` | 调整绑定顺序（`id` = 绑定行 id） |
| GET | `pass/list/{textbookId}` | 教材下小关卡下拉候选（`pageSize=1000`） |

**请求字段**

| 接口 | 字段 |
| --- | --- |
| `session/add` / `session/update` | `textbookId` `id`(客户端提交) `title` `icon` `sort` |
| `session/changeStatus` | `id` `status` |
| `session/bind` | `textbookId` `sessionId` `customPassId` |
| `session/custom/list` | `textbookId` `sessionId` |
| `session/change/sort` | `id`(绑定行) `sort` |

**响应字段**

- `session/list`：`id` `title` `icon` `status` `sort`
- `session/custom/list`：`id`(绑定行 id) `customTitle`(小关卡标题，回退 `title`) `title` `icon` `sort`(绑定顺序)

**建议模型**

```prisma
model Session {
  id         Int      @id                 // 客户端提交，非自增
  textbookId Int
  title      String
  icon       String?  @default("")
  sortValue  Int      @default(0)
  status     Int      @default(1)         // 1=启用，2=禁用
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  course     Course   @relation(fields: [textbookId], references: [textbookId], onDelete: Cascade)
  customPasses SessionCustomPass[]

  @@index([textbookId, sortValue])
}

model SessionCustomPass {
  id           Int        @id @default(autoincrement())
  sessionId    Int
  customPassId Int
  sortValue    Int        @default(0)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  session      Session    @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  customPass   CustomPass @relation(fields: [customPassId], references: [id], onDelete: Cascade)

  @@unique([sessionId, customPassId])      // 防重复绑定
  @@index([sessionId, sortValue])
}
```

> ⚠️ 路由带**前导斜杠**（`/session/list/...`）与其它 service 风格不一致，且 `session/delete`、`session/unbind` 是 GET 写操作。
> 实现时建议统一为 `session/list/:textbookId`、`session/delete`、`session/unbind` 并改 POST。

---

### 4.6 题目管理 `/subjects` — 10 个接口

**接口**：`pass/subject`(GET)、`subject/add/one`(POST)、`subject/subject/list`(POST)、`subject/decs/:topicId`(GET)、`subject/subject/update`(POST)、`subject/delete/:id`(GET)、`subject/delete/batch`(POST)、`subject/upload/pic?id=&scenePic=`(POST)、`subject/upload/pic/update?id=&scenePic=`(POST)、`subject/del/pic/:id`(GET)

**请求字段**（[subjects/types.ts](../src/app/pages/subjects/types.ts)）

| 接口 | 字段 |
| --- | --- |
| `subject/subject/list` | `startTime` `endTime` `customsPassId`(string) `customsPassName` `sourceIds` `pageNum` `pageSize` |
| `subject/add/one` | `customsPassId` `partId` `sessionId` `sourceIds` `sort` `showIndex`(**string[]**) `subject` `icon` `audio` `sentenceAudio` `sceneGraph` |
| `subject/subject/update` | **只传 5 个字段**：`id` `customsPassId` `customsPassName` `sourceIds` `sort` |
| `subject/delete/batch` | **裸 JSON 数组**（`number[]`，非对象） |
| `subject/upload/pic` / `upload/pic/update` | query `id` `scenePic`（**同时也在 body 里重复发一份**） |
| `subject/del/pic/:id` | 路径 `id` = **题目 id**（不是图片 id） |

> ⚠️ **编辑与新增的字段集不同**：编辑只提交 5 个字段，`icon`/`audio`/`sentenceAudio`/`subject`/`showIndex`/`sceneGraph` **都不通过 `subject/subject/update` 提交**；
> 场景图单独走 `upload/pic`、`upload/pic/update`、`del/pic` 三个接口（`subjects/page.tsx:290-292`）。实现时不要假设 update 是全量更新。

> ⚠️ **`subject/delete/batch` 的裸数组 body 是当前后端的首例**：现有代码没有任何 `@Body() ids: number[]` 先例，
> 且 `main.ts` 启用了全局 `ValidationPipe({ whitelist: true })`。数组类型会被 ValidationPipe 跳过，**不要给它套 class DTO**。
> 其余 service 的批量接口（`source/delete/batch` 等）也是同样形态。

> ⚠️ **`sceneGraph` 可能真的存字符串 `'null'`**：前端有 3 处专门判断 `!== 'null'`
> （`subjects/utils/forms.ts:81`、`subjects/page.tsx:235-236`、`subjects/configs/tableColumns.tsx:36`）。
> 模型必须容忍该值，读取时不要假定为 NULL。

> `originalSceneGraph` 仅存在于表单类型，用于**判断场景图是否被修改**，不提交给后端（[subjects/types.ts:66](../src/app/pages/subjects/types.ts)）。

**响应字段**（`SubjectRecord`）

| 字段 | 含义 |
| --- | --- |
| `id` | 主键（即 `topicId`） |
| `unitsName` / `partsTitle` / `partsTips` | 单元名 / Part 标题 / Part 描述（**跨两层 join 出来的别名**） |
| `customsPassId` / `customsPassName` | 所属小关卡 |
| `sourceIds` | 题目内容（字符串，语义见存疑清单） |
| `sort` | 题目顺序 |
| `sceneGraph` | 场景图 URL |
| `createdAt` | 创建时间 |
| `sourceVOS[]` | **详情接口**额外返回的素材明细：`{id,text,icon,audio}` |

> `subject/decs/:topicId` 返回的是**单个对象**（不是数组），且 `id` 字段缺失时前端会回退用 URL 里的 `topicId`。

**建议模型**

```prisma
model Subject {
  id            Int        @id @default(autoincrement())
  customsPassId Int
  partId        Int?                        // 仅 add/one 提交，是否落库存疑
  sessionId     Int?                        // 仅 add/one 提交（大关卡），是否落库存疑
  subject       Int?                        // 题型 id
  sourceIds     String     @default("")     // 语义存疑，见存疑清单
  sortValue     Int        @default(0)
  showIndex     String?    @default("")     // 提交的是 string[]，落库形式未定
  icon          String?    @default("")
  audio         String?    @default("")
  sentenceAudio String?    @default("")
  sceneGraph    String?                     // 允许空 & 字符串 "null"
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  customPass    CustomPass @relation(fields: [customsPassId], references: [id], onDelete: Cascade)

  @@index([customsPassId, sortValue])
  @@index([createdAt])
}
```

**可能还需要两个模型**（证据为「前端只消费 `{id,name}` / `sourceVOS[]`」，属于推断）：

```prisma
model SubjectType {          // pass/subject 返回的「题型」字典
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SubjectSource {        // 支撑详情返回的 sourceVOS[]
  id        Int     @id @default(autoincrement())
  subjectId Int
  sourceId  Int
  sortValue Int     @default(0)
  subject   Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@index([subjectId])
  @@index([sourceId])
}
```

> `unitsName` / `partsTitle` / `partsTips` 是**跨两层 join 的展示字段**，不落库；实现时需 `include: { customPass: { course } }` 之类再拼装，或直接写 SQL/`$queryRaw`。
> 注意别名是 `unitsName`（复数 units），属后端自定义投影，不要写成 `unitName`。
> `subject/decs/:topicId` 的 `decs` 疑似拼写错误（应为 `desc`），**需保持原名**以免前端改动。
> `SubjectSource` 若采用，必须 `onDelete: Cascade`，否则批量删题目会残留 join 行。

---

### 4.7 素材管理 `/source-material` — 8 个接口

**接口**：`source/list`(POST)、`source/add`(POST)、`source/update`(POST)、`source/delete/:id`(GET)、`source/delete/batch`(POST)、`source/audio/down/batch`(POST)、`test/send2line/source`(POST)、`subject/source/import`(POST)

**请求字段**（[source-material/types.ts](../src/app/pages/source-material/types.ts)）

| 接口 | 字段 |
| --- | --- |
| `source/list` | `startTime` `endTime` `text` `openLike`(模糊/精确开关) `pageNum` `pageSize` |
| `source/add` | `textbookId` `text`(必填) `icon` `audio` `translation` `explainsArray` |
| `source/update` | `id` + `text` `icon` `audio` `translation` `explainsArray`（**不提交 `textbookId`**，编辑态教材下拉禁用） |
| `source/delete/batch`、`source/audio/down/batch`、`test/send2line/source` | 裸 `number[]` |
| `subject/source/import` | `textbookId` `audioArray` `imageArray` `sentensArray`——**是「文件名数组」不是 URL** |

> ⚠️ **`openLike` 语义反直觉**：`''`（默认）= 模糊，`1` = 精确。且 `compactPayload` 会剔除空串，
> 所以**模糊搜索时该字段根本不发送**。后端不要望文生义地认为「不传=精确」。

> ⚠️ **`subject/source/import` 返回的是 HTML 字符串**，前端用 `dangerouslySetInnerHTML` 直接渲染
> （`source-material/page.tsx:322-331`）。这意味着：① 返回内容需按 HTML 处理；
> ② 该处存在 **XSS 面**——若导入结果可能包含用户可控内容，需要后端负责转义。

> ⚠️ **`source/list` 没有 `textbookId` 筛选**（筛选器只有时间/内容/模糊），推断素材是**跨教材的全局库**，
> 后端不要擅自加 `textbookId` 过滤。

> ⚠️ **`test/send2line/*` 不是单元测试接口**，而是面向外部系统「line」的数据同步族
> （同族还有 `test/send2line/grade/:id`、`test/send2line/textbook/:id`、`test/send2line/book/version/:id`、`test/send2line/unit/:id`），
> 在生产环境隐藏（`IS_PRODUCTION_API`）。实现前需确认该外部依赖，否则本地无法联调。

**响应字段**：`id`、`textbookId`、`text`(素材内容)、`icon`(图标)、`audio`(音频)、`translation`(单次释义)、`explainsArray`(多次释义)、`createdAt`

> 列表**必须回传 `textbookId`**，否则编辑弹窗的教材下拉为空（`utils/forms.ts:64`）。

**建议模型**

```prisma
model SourceMaterial {
  id             Int      @id @default(autoincrement())
  textbookId     Int
  text           String
  icon           String?  @default("")
  audio          String?  @default("")
  translation    String?  @default("")      // 单次释义
  explainsArray  String?  @default("")      // 多次释义，疑似 JSON 字符串
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  course         Course   @relation(fields: [textbookId], references: [textbookId], onDelete: Cascade)

  @@index([textbookId])
  @@index([text])
  @@index([createdAt])
}
```

> `explainsArray` 在接口层是 **string** 类型，但字段名暗示数组。需确认是 JSON 序列化字符串还是逗号分隔。
> **不要**添加 `status` / `canLock` / `sortValue`，也**没有素材类型枚举字段**——图标与音频是两个并列 URL 字段（`icon`/`audio`），
> 这是基于「全页无任何取值来源」的负面证据。
> 旧实现还有一个 `phonetic`（音标）字段，新版前端已移除；若要兼容历史数据可先建可空列。

---

### 4.8 邀请明细 `/invite-count` — 1 个接口

**接口**：`member/invite/list`(POST)

**⚠️ 关键**：请求体是**裸数字**（不是对象），且语义是 **tutuNumber 而非 member.id**：

```ts
// services/invite-count.ts:4
const response = await http.post<ApiEnvelope<ApiListResult>>('member/invite/list', userId);
```

```jsx
// members/configs/tableColumns.jsx:33 —— 传的是 tutuNumber
<Link to={`/invite-count?userId=${member.tutuNumber}`}>
```

页面自己也把该参数显示为「当前图图号」（`invite-count/page.tsx:64`）。**若按 `Member.id` 实现会查不到数据。**

**响应字段**（[invite-count/types.ts](../src/app/pages/invite-count/types.ts)）：`tutuNumber`、`realName`、`icon`、`mobile`、`inviteTime`

**schema 缺口**：`Member` 目前只有聚合字段 `inviteCount`，**没有邀请人关系**：

```prisma
model Member {
  inviteCount Int @default(0)   // 只有计数，无法查出「邀请了谁」
  // ... 没有 inviterId / inviter 关系
}
```

**两种补法**（需拍板）：

- **A**：`Member` 增加自关联 `inviterId Int?` + `inviter Member? @relation("MemberInvite", ...)` —— 适合「一个会员只有一个邀请人」。
- **B**：新增 `MemberInvite { id, inviterId, inviteeId, createdAt }` —— 更灵活，且 `inviteTime` 有独立落点。

> `inviteTime` 无法从 `Member` 现有字段推出（`Member` 没有「被邀请时间」），倾向**方案 B**。

另外该页**不做服务端分页**（前端用 antd 客户端分页，见 `page.tsx:49-53`），后端需一次返回全部或约定一个上限。

---

### 4.9 学习记录 `/learning-record` — 1 个接口

**接口**：`member/pass/record`(POST)

**请求字段**：`userId`（同样是 **tutuNumber**，见 `members/configs/tableColumns.jsx:75`）、`pageNum`、`pageSize`

**响应字段**（[learning-record/types.ts](../src/app/pages/learning-record/types.ts)）：

| 字段 | 含义 |
| --- | --- |
| `textbookName` | 教材名称 |
| `unitName` | 单元名称 |
| `partName` | Part 名称 |
| `sessionName` | **关卡名称**（注意：列标题是「关卡名称」） |
| `createdAt` | 学习时间 |

**建议模型**

```prisma
model LearningRecord {
  id         Int      @id @default(autoincrement())
  memberId   Int                          // 建议存 Member.id（入参需先由 tutuNumber 转换）
  textbookId Int?
  unitId     Int?
  partId     Int?
  sessionId  Int?
  createdAt  DateTime @default(now())
  member     Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  textbook   Course?  @relation(fields: [textbookId], references: [textbookId])

  @@index([memberId, createdAt])
}
```

> `textbookName`/`unitName`/`partName`/`sessionName` 都是**join 展示字段**，不落库。
> ⚠️ 该表引用 Unit/Part/Session，**必须在这三张表建好之后才能实现**，是整个清单里依赖最重的接口。

---

## 5. 需要新增的 Prisma 模型（汇总）

| # | 模型 | 依赖 | 所属页面 |
| --- | --- | --- | --- |
| 1 | `Unit` | `Course` | units |
| 2 | `Part` | `Unit` | parts |
| 3 | `Pass` | `Part` | passes |
| 4 | `CustomPass` | `Course` | custom-passes |
| 5 | `Session` | `Course` | sessions |
| 6 | `SessionCustomPass` | `Session` + `CustomPass` | sessions |
| 7 | `Subject` | `CustomPass` | subjects |
| 8 | `SourceMaterial` | `Course` | source-material |
| 9 | `MemberInvite`（或改 `Member`） | `Member` | invite-count |
| 10 | `LearningRecord` | `Member` + Unit/Part/Session | learning-record |

**可选模型**（仅当确认需要时才建）：

| # | 模型 | 用途 | 触发条件 |
| --- | --- | --- | --- |
| A | `SubjectType` | `pass/subject` 返回的「题型」 | 若题型不是枚举而是可维护的数据表 |
| B | `SubjectSource` | 题目 ↔ 素材的关联 | 若 `sourceIds` 是素材 id 串而非题目正文 |

> 若采纳 3.3 的**单表方案**，则上面的 `Pass` 与 `CustomPass` 合并为 1 个模型，总数减 1。

**对现有模型的改动**

| 模型 | 改动 | 原因 |
| --- | --- | --- |
| `Course` | 增加反向关系：`units Unit[]`、`customPasses CustomPass[]`、`sessions Session[]`、`sourceMaterials SourceMaterial[]` | 新增模型需外键指向 `Course.textbookId` |
| `Member` | 增加邀请关系（或用 `MemberInvite`） | `inviteCount` 只有计数，查不出明细 |

> 外键目标说明：`Course` 的主键是 `textbookId`（非 `id`），因此新模型引用教材时必须写
> `references: [textbookId]`，可参照现有 `SpecialCourse` 的写法。

---

## 6. 建议实施顺序

按**依赖关系**排序，每步都能独立验证：

| 阶段 | 内容 | 说明 |
| --- | --- | --- |
| **0** | 先定 3.1 / 3.2 / 3.3 三个决策 | 否则后续返工 |
| **1** | `Unit` + `unit/*` (5) | 链 A 的根，`Course` 已存在 |
| **2** | `Part` + `part/*` (4) | 依赖 `Unit` |
| **3** | `Pass` + `pass/*` (5) | 依赖 `Part`；含 `pass/subject` |
| **4** | `SourceMaterial` + `source/*` (8) | 只依赖 `Course`，可与 1–3 并行 |
| **5** | `CustomPass` + `pass/*` (6) | 依赖 `Course`；注意与阶段 3 共用路径的歧义 |
| **6** | `Subject` + `subject/*` (10) | 依赖 `CustomPass` + `SourceMaterial` |
| **7** | `Session` + `SessionCustomPass` + `session/*` (10) | 依赖 `CustomPass` |
| **8** | `MemberInvite` + `member/invite/list` (1) | 独立，可随时插入 |
| **9** | `LearningRecord` + `member/pass/record` (1) | 依赖 Unit/Part/Session，放最后 |

**补充建议**

- **先修 1.4 的解包 bug**（`custom-passes.ts:13`、`sessions.ts:8` 两处），否则阶段 5、7 做完页面依然是空的，容易误判成后端没写对。
- 每完成一个模块，把接口补进 [API.md](./API.md)，并为 service 写单测（参照现有 `backend/test/special-courses.service.test.ts`）。
- 新增写接口一律用 POST（沿用第二项修复后确立的约定）。
- 修复 [legacy-api-exception.filter.ts](../backend/src/modules/auth/legacy-api-exception.filter.ts) 把 404/500 也返回 200 的行为——否则后续排查这类问题依然看不到真实状态码。
- `seed.ts` 的菜单只有 7 条，新增页面后如需按菜单鉴权，需要同步补齐菜单数据。
- 「题型」（`pass/subject`）与 `sceneGraph` 的 `'null'` 是最容易实现错的两个点，建议各写一条集成测试断言。

---

## 7. 存疑清单（实现前需确认）

| # | 问题 | 影响 |
| --- | --- | --- |
| 1 | `pass/list/:id` 的 `:id` 语义如何区分（3.1） | 阻塞 passes / custom-passes / sessions |
| 2 | 「关卡」与「小关卡」是一张表还是两张表（3.3） | 影响 4 个模型的划分 |
| 3 | `Pass.customerNumber` / `totalScore` 是聚合还是冗余落库 | 影响是否需要答题流水表 |
| 4 | `sourceIds` 语义：是题目正文文本，还是素材 id 串？ | 决定是否需要 `SubjectSource` 关联表 |
| 5 | `explainsArray` 是 JSON 字符串还是逗号分隔 | 影响存储与查询 |
| 6 | `inviteTime` 的落点（`Member` 还是 `MemberInvite`） | 影响 4.8 的建模选择 |
| 7 | `test/send2line/*` 对接的外部服务是什么 | 可能无法在本地环境验证 |
| 8 | `unit/lock`、`part/update` 的 `canLock` 完整取值域 | 代码只见 1/2，勿臆造其它值 |
| 9 | `sort` 是否可空、默认值 | 各模型 `sortValue` 的定义 |
| 10 | `unit/del`、`part/del`、`pass/delete` 改为 POST 后 id 走 body 还是路径 | 需与前端同步改 |
| 11 | 前导斜杠（`/session/list`）与 GET 写操作是否一并规整 | 影响前端 service 改动量 |
| 12 | 空串清空语义：`compactPayload` 会丢弃空串，导致图片/描述无法清空 | 可能需要前端改传 `null` |
| 13 | 「题型」是独立表、字典还是枚举？（`pass/subject`） | 决定是否建 `SubjectType` |
| 14 | `showIndex` 的落库形式（前端提交 `string[]`，无字段回显） | 建议先查旧库数据 |
| 15 | `Subject.partId` / `sessionId` 是否真的持久化 | 只出现在 `subject/add/one` 请求体 |
| 16 | `sceneGraph` 是否真的存字符串 `'null'` | 前端 3 处专门判断，模型需容忍 |
| 17 | 小关卡 `id` 由客户端指定，关卡却自增 —— 主键策略如何统一 | 直接影响 3.3 的方案选择 |
| 18 | `sourceIds` 模糊查询是 `contains` 还是 `in` | 影响查询实现与索引 |
| 19 | `subject/source/import` 返回 HTML 的转义责任方 | 涉及 XSS 面 |
| 20 | 菜单数据只有 7 条，新增页面后是否需补菜单 | 影响按菜单鉴权的可行性 |

> 第 1、2、3、6、13、17 项会**显著改变数据模型**，建议优先确认；
> 其余多为字段细节，可在开发中逐步敲定。

---

## 附：复核方式

```bash
# 统计「前端已调用、后端未实现」的接口（实现完成后应为 0）
node scripts/audit-missing-api.mjs

# 接口覆盖校验：前端调用的接口后端是否都已实现，文档契约是否都存在
node scripts/verify-api-coverage.mjs backend/MISSING-API.md
```

`verify-api-coverage.mjs` 校验两条不变量：

1. 前端 `src/app/services` 调用的每个接口，后端都必须已实现；
2. 本文档中出现的、属于前端契约的接口，也必须能在后端找到。

> 该脚本取代了实现完成前的 `verify-missing-api-doc.mjs`（当时校验的是「文档里的接口确实还没实现」，
> 实现完成后语义反转，故改写为覆盖校验）。

> 统计口径说明：**50** 是「调用点」数量，**43** 是「去重后的路由」数量。
> 差额来自 `pass/*` 被 passes / custom-passes / sessions / subjects 四个 service 共用。
