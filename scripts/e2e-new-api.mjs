/* 新增接口的真实 HTTP 端到端验证（连真实 DB） */
const BASE = 'http://localhost:3000';

let token = '';
const results = [];

async function api(method, path, body, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token && !opts.noAuth) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = { parseError: true };
  }
  return { http: res.status, json };
}

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  console.log('═══ 0. 登录 ═══');
  const login = await api('POST', 'user/login', { account: 'admin', password: 'admin123456' }, { noAuth: true });
  token = login.json?.data?.token || '';
  record('POST /user/login', login.json?.code === 0 && !!token, `roleId=${login.json?.data?.roleId}`);

  console.log('\n═══ 1. 准备数据（取教材 / 会员）═══');
  const books = await api('POST', 'book/list', { pageNum: 1, pageSize: 5 });
  const book = books.json?.data?.data?.[0];
  record('POST /book/list', books.json?.code === 0, `共 ${books.json?.data?.totalCount} 本教材`);
  const textbookId = book?.id;
  console.log(`     使用 textbookId=${textbookId}`);

  const members = await api('POST', 'member/all/list', { pageNum: 1, pageSize: 5 });
  const member = members.json?.data?.data?.[0];
  record('POST /member/all/list', members.json?.code === 0, `共 ${members.json?.data?.totalCount} 个会员`);
  const tutuNumber = member?.tutuNumber;
  console.log(`     使用 tutuNumber=${tutuNumber}`);

  console.log('\n═══ 2. 单元 Units ═══');
  const unitAdd = await api('POST', 'unit/add', { text: 'E2E 单元', textBookId: textbookId, sort: 1 });
  record('POST /unit/add', unitAdd.json?.code === 0, unitAdd.json?.message);

  const unitList = await api('POST', 'unit/list', { textBookId: textbookId, pageNum: 1, pageSize: 10 });
  const unitRow = unitList.json?.data?.data?.find((u) => u.text === 'E2E 单元');
  record(
    'POST /unit/list',
    unitList.json?.code === 0 && !!unitRow && !!unitRow.textBookName,
    `textBookName="${unitRow?.textBookName}"（join 生效）`,
  );
  const unitId = unitRow?.id;

  const unitLock = await api('POST', `unit/lock?unitId=${unitId}&canLock=2`);
  record('POST /unit/lock', unitLock.json?.code === 0, unitLock.json?.message);

  console.log('\n═══ 3. Part ═══');
  const partAdd = await api('POST', 'part/add', { title: 'E2E Part', unitsId: unitId, tips: '描述', sort: 1 });
  record('POST /part/add', partAdd.json?.code === 0, partAdd.json?.message);

  const partList = await api('POST', 'part/list', { unitId, pageNum: 1, pageSize: 10 });
  const partRow = partList.json?.data?.data?.find((p) => p.title === 'E2E Part');
  record('POST /part/list（unitId 映射 unitsId）', partList.json?.code === 0 && !!partRow, `unitsId=${partRow?.unitsId}`);
  const partId = partRow?.id;

  const partLock = await api('POST', 'part/update', { id: partId, canLock: 2 });
  record('POST /part/update（部分更新=锁定切换）', partLock.json?.code === 0, partLock.json?.message);

  console.log('\n═══ 4. 关卡 Pass（单表 + query 分流）═══');
  const subjectTypes = await api('GET', 'pass/subject');
  record(
    'GET /pass/subject（题型字典，双层 data）',
    subjectTypes.json?.code === 0 && Array.isArray(subjectTypes.json?.data?.data),
    `当前题型数=${subjectTypes.json?.data?.data?.length}（SubjectType 未预置数据，符合预期）`,
  );

  const passAdd = await api('POST', 'pass/add', { title: 'E2E 关卡', partsId: partId, subject: 1, sort: 1 });
  record('POST /pass/add（关卡形态）', passAdd.json?.code === 0, passAdd.json?.message);

  const passListByPart = await api('GET', `pass/list/${partId}?partsId=${partId}&pageNum=1&pageSize=10`);
  const passRow = passListByPart.json?.data?.data?.find((p) => p.title === 'E2E 关卡');
  record('GET /pass/list/:id（按 partsId 分流）', passListByPart.json?.code === 0 && !!passRow, `partsId=${passRow?.partsId}`);

  const customPassId = 90001;
  const customPassAdd = await api('POST', 'pass/add', {
    id: customPassId,
    title: 'E2E 小关卡',
    tmpTitle: '过渡',
    textbookId,
  });
  record('POST /pass/add（小关卡形态，客户端指定 id）', customPassAdd.json?.code === 0, customPassAdd.json?.message);

  const passListByBook = await api('GET', `pass/list/${textbookId}?textbookId=${textbookId}&pageNum=1&pageSize=10`);
  const customPassRow = passListByBook.json?.data?.data?.find((p) => p.id === customPassId);
  record(
    'GET /pass/list/:id（按 textbookId 分流）',
    passListByBook.json?.code === 0 && !!customPassRow && customPassRow.tmpTitle === '过渡',
    `tmpTitle=${customPassRow?.tmpTitle}`,
  );

  const passListNoDimension = await api('GET', 'pass/list?pageNum=1&pageSize=10');
  record(
    'GET /pass/list（两个维度都缺失 → 明确报错，不猜）',
    passListNoDimension.json?.code === 1,
    passListNoDimension.json?.message,
  );

  console.log('\n═══ 5. 大关卡 Session + 绑定 ═══');
  const sessionId = 80001;
  const sessionAdd = await api('POST', 'session/add', { id: sessionId, textbookId, title: 'E2E 大关卡', sort: 1 });
  record('POST /session/add（客户端指定 id）', sessionAdd.json?.code === 0, sessionAdd.json?.message);

  const sessionList = await api('GET', `session/list/${textbookId}`);
  const sessionRow = sessionList.json?.data?.find((s) => s.id === sessionId);
  record('GET /session/list/:textbookId（裸数组）', sessionList.json?.code === 0 && !!sessionRow, `title=${sessionRow?.title}`);

  const bind = await api('POST', `session/bind?textbookId=${textbookId}&sessionId=${sessionId}&customPassId=${customPassId}`);
  record('POST /session/bind', bind.json?.code === 0, bind.json?.message);

  const bindAgain = await api('POST', `session/bind?textbookId=${textbookId}&sessionId=${sessionId}&customPassId=${customPassId}`);
  record('POST /session/bind（重复绑定 → 明确报错）', bindAgain.json?.code === 1, bindAgain.json?.message);

  const boundList = await api('POST', `session/custom/list?textbookId=${textbookId}&sessionId=${sessionId}`);
  const boundRow = boundList.json?.data?.[0];
  record(
    'POST /session/custom/list（裸数组 + customTitle）',
    boundList.json?.code === 0 && !!boundRow,
    `customTitle=${boundRow?.customTitle}, 绑定行 id=${boundRow?.id}`,
  );

  const status = await api('POST', `session/changeStatus?id=${sessionId}&status=2`);
  record('POST /session/changeStatus', status.json?.code === 0, status.json?.message);

  const sortRes = await api('POST', `session/change/sort?id=${boundRow?.id}&sort=5`);
  record('POST /session/change/sort', sortRes.json?.code === 0, sortRes.json?.message);

  console.log('\n═══ 6. 题目 Subject ═══');
  const subjectAdd = await api('POST', 'subject/add/one', {
    customsPassId: customPassId,
    sourceIds: 'E2E 题目内容',
    sort: 1,
    showIndex: ['1', '2'],
  });
  record('POST /subject/add/one', subjectAdd.json?.code === 0, subjectAdd.json?.message);

  const subjectList = await api('POST', 'subject/subject/list', { customsPassId: customPassId, pageNum: 1, pageSize: 10 });
  const subjectRow = subjectList.json?.data?.data?.[0];
  record(
    'POST /subject/subject/list（join 字段拼装）',
    subjectList.json?.code === 0 && !!subjectRow,
    `unitsName="${subjectRow?.unitsName}" partsTitle="${subjectRow?.partsTitle}" customsPassName="${subjectRow?.customsPassName}"`,
  );

  const subjectDetail = await api('GET', `subject/decs/${subjectRow?.id}`);
  record(
    'GET /subject/decs/:topicId（返回单对象）',
    subjectDetail.json?.code === 0 && !Array.isArray(subjectDetail.json?.data) && subjectDetail.json?.data?.id === subjectRow?.id,
    `id=${subjectDetail.json?.data?.id}`,
  );

  const scenePic = await api('POST', `subject/upload/pic?id=${subjectRow?.id}&scenePic=${encodeURIComponent('http://x/y.png')}`);
  record('POST /subject/upload/pic', scenePic.json?.code === 0, scenePic.json?.message);

  const delPic = await api('POST', `subject/del/pic/${subjectRow?.id}`);
  record('POST /subject/del/pic/:id', delPic.json?.code === 0, delPic.json?.message);

  console.log('\n═══ 7. 素材 SourceMaterial ═══');
  const sourceAdd = await api('POST', 'source/add', {
    textbookId,
    text: 'E2E 素材',
    translation: '单次释义',
    explainsArray: '多次释义',
  });
  record('POST /source/add', sourceAdd.json?.code === 0, sourceAdd.json?.message);

  const sourceList = await api('POST', 'source/list', { pageNum: 1, pageSize: 10 });
  const sourceRow = sourceList.json?.data?.data?.find((s) => s.text === 'E2E 素材');
  record('POST /source/list（回传 textbookId）', sourceList.json?.code === 0 && !!sourceRow && !!sourceRow.textbookId, `textbookId=${sourceRow?.textbookId}`);
  const sourceId = sourceRow?.id;

  const sourceBlur = await api('POST', 'source/list', { text: '素材', pageNum: 1, pageSize: 10 });
  const sourceExact = await api('POST', 'source/list', { text: 'E2E 素材', openLike: 1, pageNum: 1, pageSize: 10 });
  record(
    'POST /source/list（openLike: 缺省=模糊, 1=精确）',
    sourceBlur.json?.code === 0 && sourceExact.json?.code === 0 && (sourceExact.json?.data?.totalCount ?? 0) >= 1,
    `模糊命中=${sourceBlur.json?.data?.totalCount}, 精确命中=${sourceExact.json?.data?.totalCount}`,
  );

  const sourceBatchDel = await api('POST', 'source/delete/batch', [sourceId]);
  record('POST /source/delete/batch（裸数组 body）', sourceBatchDel.json?.code === 0, sourceBatchDel.json?.message);

  const send2line = await api('POST', 'test/send2line/source', [1]);
  record('POST /test/send2line/source（未配置外部服务 → 明确报错）', send2line.json?.code === 1, send2line.json?.message);

  const audioDown = await api('POST', 'source/audio/down/batch', [1]);
  record('POST /source/audio/down/batch（未配置 → 明确报错）', audioDown.json?.code === 1, audioDown.json?.message);

  const sourceImport = await api('POST', 'subject/source/import', { textbookId, audioArray: ['a.mp3'] });
  record('POST /subject/source/import（未配置 → 明确报错）', sourceImport.json?.code === 1, sourceImport.json?.message);

  console.log('\n═══ 8. 会员：邀请明细 / 学习记录（tutuNumber）═══');
  const invites = await api('POST', 'member/invite/list', tutuNumber);
  record(
    'POST /member/invite/list（裸数字 body = tutuNumber）',
    invites.json?.code === 0 && Array.isArray(invites.json?.data?.data),
    `总条数=${invites.json?.data?.totalCount}`,
  );

  const badInvite = await api('POST', 'member/invite/list', 999999);
  record('POST /member/invite/list（不存在的图图号）', badInvite.json?.code === 1, badInvite.json?.message);

  const records = await api('POST', 'member/pass/record', { userId: tutuNumber, pageNum: 1, pageSize: 10 });
  record(
    'POST /member/pass/record（tutuNumber → memberId）',
    records.json?.code === 0 && Array.isArray(records.json?.data?.data),
    `总条数=${records.json?.data?.totalCount}`,
  );

  console.log('\n═══ 9. 鉴权仍生效 ═══');
  const noAuth = await api('POST', 'unit/list', {}, { noAuth: true });
  record('POST /unit/list（无 token → 401 / code 45）', noAuth.http === 401 || noAuth.json?.code === 45, `http=${noAuth.http} code=${noAuth.json?.code}`);

  console.log('\n═══ 10. 清理 e2e 数据 ═══');
  const delSubject = await api('POST', `subject/delete/${subjectRow?.id}`);
  record('POST /subject/delete/:id', delSubject.json?.code === 0, delSubject.json?.message);
  const unbind = await api('POST', `session/unbind/${boundRow?.id}`);
  record('POST /session/unbind/:id', unbind.json?.code === 0, unbind.json?.message);
  const delPass = await api('POST', `pass/delete/${passRow?.id}`);
  record('POST /pass/delete/:id（关卡）', delPass.json?.code === 0, delPass.json?.message);
  const delCustomPass = await api('POST', `pass/delete?id=${customPassId}&textbookId=${textbookId}`);
  record('POST /pass/delete（query 形态，小关卡）', delCustomPass.json?.code === 0, delCustomPass.json?.message);
  const delSession = await api('POST', `session/delete/${sessionId}`);
  record('POST /session/delete/:id', delSession.json?.code === 0, delSession.json?.message);
  const delPart = await api('POST', `part/del/${partId}`);
  record('POST /part/del/:id', delPart.json?.code === 0, delPart.json?.message);
  const delUnit = await api('POST', `unit/del/${unitId}`);
  record('POST /unit/del/:id', delUnit.json?.code === 0, delUnit.json?.message);

  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  console.log(`\n═══════════════════════════════════════`);
  console.log(`总计 ${results.length} 项：通过 ${pass}，失败 ${fail}`);
  if (fail) {
    console.log('\n失败项：');
    results.filter((r) => !r.ok).forEach((r) => console.log(`  ✗ ${r.name} — ${r.detail}`));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('脚本异常:', e);
  process.exitCode = 1;
});
