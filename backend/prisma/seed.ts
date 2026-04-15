import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/common/password';

const prisma = new PrismaClient();

function daysFromNow(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value;
}

function daysAgo(days: number) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value;
}

async function resetSerialSequence(tableName: string, columnName = 'id') {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', '${columnName}'), COALESCE(MAX("${columnName}"), 1), true) FROM "${tableName}";`,
  );
}

async function main() {
  const adminPasswordHash = await hashPassword(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456');
  const opsPasswordHash = await hashPassword('ops123456');
  const editorPasswordHash = await hashPassword('editor123456');

  const menuSeeds = [
    {
      menuName: '用户管理',
      parentId: null,
      path: '/userSetting',
      icon: 'team',
      menuScope: 1,
      url: 'user/list',
      status: 1,
      sortValue: 10,
    },
    {
      menuName: '角色管理',
      parentId: null,
      path: '/roleSetting',
      icon: 'user-add',
      menuScope: 1,
      url: 'role/list',
      status: 1,
      sortValue: 20,
    },
    {
      menuName: '菜单管理',
      parentId: null,
      path: '/authMenu',
      icon: 'bars',
      menuScope: 1,
      url: 'menu/list',
      status: 1,
      sortValue: 30,
    },
    {
      menuName: '教材管理',
      parentId: null,
      path: '/teachingManage/book',
      icon: 'book',
      menuScope: 1,
      url: 'book/list',
      status: 1,
      sortValue: 40,
    },
    {
      menuName: 'App版本控制',
      parentId: null,
      path: '/appverUpdate',
      icon: 'reload',
      menuScope: 1,
      url: 'app/version/page',
      status: 1,
      sortValue: 50,
    },
    {
      menuName: '会员管理',
      parentId: null,
      path: '/memberSetting',
      icon: 'crown',
      menuScope: 1,
      url: 'member/list',
      status: 1,
      sortValue: 60,
    },
    {
      menuName: '订单管理',
      parentId: null,
      path: '/orderSetting',
      icon: 'shopping-cart',
      menuScope: 1,
      url: 'order/list',
      status: 1,
      sortValue: 70,
    },
  ];

  const adminRole = await prisma.role.upsert({
    where: { name: '超级管理员' },
    update: {},
    create: { name: '超级管理员' },
  });

  const opsRole = await prisma.role.upsert({
    where: { name: '运营角色' },
    update: {},
    create: { name: '运营角色' },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: '内容编辑' },
    update: {},
    create: { name: '内容编辑' },
  });

  const menus = [];
  for (const menu of menuSeeds) {
    const saved = await prisma.menu.upsert({
      where: { path: menu.path },
      update: {
        menuName: menu.menuName,
        parentId: menu.parentId,
        icon: menu.icon,
        menuScope: menu.menuScope,
        url: menu.url,
        status: menu.status,
        sortValue: menu.sortValue,
      },
      create: menu,
    });
    menus.push(saved);
  }

  await prisma.roleMenu.deleteMany({});

  await prisma.roleMenu.createMany({
    data: menus.map((menu) => ({
      roleId: adminRole.id,
      menuId: menu.id,
    })),
  });

  const opsMenus = menus.filter((menu) =>
    ['/userSetting', '/memberSetting', '/orderSetting', '/appverUpdate'].includes(menu.path),
  );
  await prisma.roleMenu.createMany({
    data: opsMenus.map((menu) => ({
      roleId: opsRole.id,
      menuId: menu.id,
    })),
  });

  const editorMenus = menus.filter((menu) =>
    ['/teachingManage/book', '/authMenu'].includes(menu.path),
  );
  await prisma.roleMenu.createMany({
    data: editorMenus.map((menu) => ({
      roleId: editorRole.id,
      menuId: menu.id,
    })),
  });

  await prisma.user.upsert({
    where: { account: process.env.DEFAULT_ADMIN_ACCOUNT || 'admin' },
    update: {
      username: process.env.DEFAULT_ADMIN_ACCOUNT || 'admin',
      passwordHash: adminPasswordHash,
      avatar: process.env.DEFAULT_ADMIN_AVATAR || 'https://placehold.co/160x160/png',
      phone: '13800000001',
      email: 'admin@tutu.local',
      name: '系统管理员',
      sex: 1,
      roleId: adminRole.id,
      status: 1,
    },
    create: {
      account: process.env.DEFAULT_ADMIN_ACCOUNT || 'admin',
      username: process.env.DEFAULT_ADMIN_ACCOUNT || 'admin',
      passwordHash: adminPasswordHash,
      avatar: process.env.DEFAULT_ADMIN_AVATAR || 'https://placehold.co/160x160/png',
      phone: '13800000001',
      email: 'admin@tutu.local',
      name: '系统管理员',
      sex: 1,
      roleId: adminRole.id,
      status: 1,
    },
  });

  await prisma.user.upsert({
    where: { account: 'ops_demo' },
    update: {
      username: 'ops_demo',
      passwordHash: opsPasswordHash,
      avatar: 'https://placehold.co/160x160/png?text=OPS',
      phone: '13800000002',
      email: 'ops@tutu.local',
      name: '运营同学',
      sex: 2,
      roleId: opsRole.id,
      status: 1,
    },
    create: {
      account: 'ops_demo',
      username: 'ops_demo',
      passwordHash: opsPasswordHash,
      avatar: 'https://placehold.co/160x160/png?text=OPS',
      phone: '13800000002',
      email: 'ops@tutu.local',
      name: '运营同学',
      sex: 2,
      roleId: opsRole.id,
      status: 1,
    },
  });

  await prisma.user.upsert({
    where: { account: 'editor_demo' },
    update: {
      username: 'editor_demo',
      passwordHash: editorPasswordHash,
      avatar: 'https://placehold.co/160x160/png?text=EDT',
      phone: '13800000003',
      email: 'editor@tutu.local',
      name: '内容编辑',
      sex: 1,
      roleId: editorRole.id,
      status: 1,
    },
    create: {
      account: 'editor_demo',
      username: 'editor_demo',
      passwordHash: editorPasswordHash,
      avatar: 'https://placehold.co/160x160/png?text=EDT',
      phone: '13800000003',
      email: 'editor@tutu.local',
      name: '内容编辑',
      sex: 1,
      roleId: editorRole.id,
      status: 1,
    },
  });

  const memberLevels = [
    {
      userLevel: 0,
      levelName: '普通用户',
      explainInfo: '未开通会员的默认等级',
      exprieDays: 0,
      orgMoney: 0,
      needMoney: 0,
      icon: 'https://placehold.co/120x120/png?text=BASE',
    },
    {
      userLevel: 1,
      levelName: '月度会员',
      explainInfo: '适合短周期体验用户',
      exprieDays: 30,
      orgMoney: 3999,
      needMoney: 2999,
      icon: 'https://placehold.co/120x120/png?text=M1',
    },
    {
      userLevel: 2,
      levelName: '季度会员',
      explainInfo: '适合稳定使用的家庭用户',
      exprieDays: 90,
      orgMoney: 9999,
      needMoney: 6999,
      icon: 'https://placehold.co/120x120/png?text=Q1',
    },
    {
      userLevel: 3,
      levelName: '年度会员',
      explainInfo: '全年畅学的高价值会员档位',
      exprieDays: 365,
      orgMoney: 39999,
      needMoney: 19999,
      icon: 'https://placehold.co/120x120/png?text=Y1',
    },
  ];

  for (const level of memberLevels) {
    await prisma.memberLevel.upsert({
      where: { userLevel: level.userLevel },
      update: level,
      create: level,
    });
  }

  const memberSeeds = [
    {
      tutuNumber: 100001,
      realName: '朵朵',
      icon: 'https://placehold.co/120x120/png?text=M01',
      inviteCount: 5,
      channel: 1,
      hasBuyTextbook: 1,
      payTime: daysAgo(18),
      exprieTime: daysFromNow(12),
      userMoney: 26800,
      mobile: '13900000001',
      email: 'member001@tutu.local',
      birthday: new Date('2018-06-08T00:00:00.000Z'),
      sex: 2,
      hasSetPassword: 1,
      bookVersionName: '图图英语启蒙版',
      textbookNamePractice: 'L1 Starter',
      status: 1,
      userLevel: 1,
      createdAt: daysAgo(120),
    },
    {
      tutuNumber: 100002,
      realName: '辰辰',
      icon: 'https://placehold.co/120x120/png?text=M02',
      inviteCount: 12,
      channel: 1,
      hasBuyTextbook: 1,
      payTime: daysAgo(56),
      exprieTime: daysFromNow(34),
      userMoney: 58800,
      mobile: '13900000002',
      email: 'member002@tutu.local',
      birthday: new Date('2017-11-16T00:00:00.000Z'),
      sex: 1,
      hasSetPassword: 1,
      bookVersionName: '图图英语进阶版',
      textbookNamePractice: 'L2 Skills',
      status: 1,
      userLevel: 2,
      createdAt: daysAgo(200),
    },
    {
      tutuNumber: 100003,
      realName: '诺诺',
      icon: 'https://placehold.co/120x120/png?text=M03',
      inviteCount: 1,
      channel: 2,
      hasBuyTextbook: 0,
      payTime: null,
      exprieTime: null,
      userMoney: 0,
      mobile: '13900000003',
      email: 'member003@tutu.local',
      birthday: new Date('2019-01-12T00:00:00.000Z'),
      sex: 2,
      hasSetPassword: 2,
      bookVersionName: '',
      textbookNamePractice: '',
      status: 1,
      userLevel: 0,
      createdAt: daysAgo(45),
    },
    {
      tutuNumber: 100004,
      realName: '安安',
      icon: 'https://placehold.co/120x120/png?text=M04',
      inviteCount: 8,
      channel: 1,
      hasBuyTextbook: 1,
      payTime: daysAgo(160),
      exprieTime: daysFromNow(205),
      userMoney: 129900,
      mobile: '13900000004',
      email: 'member004@tutu.local',
      birthday: new Date('2016-08-30T00:00:00.000Z'),
      sex: 1,
      hasSetPassword: 1,
      bookVersionName: '图图阅读精讲',
      textbookNamePractice: 'L4 Master',
      status: 1,
      userLevel: 3,
      createdAt: daysAgo(360),
    },
    {
      tutuNumber: 100005,
      realName: '沐沐',
      icon: 'https://placehold.co/120x120/png?text=M05',
      inviteCount: 0,
      channel: 2,
      hasBuyTextbook: 0,
      payTime: daysAgo(12),
      exprieTime: daysFromNow(18),
      userMoney: 2999,
      mobile: '13900000005',
      email: 'member005@tutu.local',
      birthday: new Date('2018-09-02T00:00:00.000Z'),
      sex: 2,
      hasSetPassword: 1,
      bookVersionName: '',
      textbookNamePractice: '',
      status: 2,
      userLevel: 1,
      createdAt: daysAgo(22),
    },
    {
      tutuNumber: 100006,
      realName: '言言',
      icon: 'https://placehold.co/120x120/png?text=M06',
      inviteCount: 3,
      channel: 1,
      hasBuyTextbook: 1,
      payTime: daysAgo(88),
      exprieTime: daysAgo(2),
      userMoney: 6999,
      mobile: '13900000006',
      email: 'member006@tutu.local',
      birthday: new Date('2017-04-18T00:00:00.000Z'),
      sex: 1,
      hasSetPassword: 1,
      bookVersionName: '图图进阶专项',
      textbookNamePractice: 'L3 Focus',
      status: 1,
      userLevel: 2,
      createdAt: daysAgo(160),
    },
  ];

  const memberIdMap = new Map<number, number>();
  for (const member of memberSeeds) {
    const saved = await prisma.member.upsert({
      where: { tutuNumber: member.tutuNumber },
      update: member,
      create: member,
    });
    memberIdMap.set(member.tutuNumber, saved.id);
  }

  await prisma.memberFeedback.deleteMany({});

  await prisma.memberFeedback.createMany({
    data: [
      {
        memberId: memberIdMap.get(100001)!,
        content: '希望增加更多启蒙口语练习内容。',
        createdAt: daysAgo(3),
      },
      {
        memberId: memberIdMap.get(100002)!,
        content: '课程进度同步速度可以再快一些。',
        createdAt: daysAgo(8),
      },
      {
        memberId: memberIdMap.get(100004)!,
        content: '年度会员活动不错，期待更多教材包。',
        createdAt: daysAgo(15),
      },
      {
        memberId: memberIdMap.get(100006)!,
        content: '已购课程筛选希望支持按教材版本查看。',
        createdAt: daysAgo(27),
      },
    ],
  });

  const activities = [
    {
      id: 1,
      title: '新春限时会员活动',
      content: '春节期间购买年度会员享专属优惠。',
      icon: 'https://placehold.co/320x180/png?text=Spring',
      activeMoney: 129900,
      status: 1,
      activityType: 1,
      itemId: 1,
      activeExpireDays: 30,
      beginAt: daysAgo(7),
      endAt: daysFromNow(23),
      url: 'https://example.com/activities/spring',
      createdAt: daysAgo(10),
    },
    {
      id: 2,
      title: '开学季课程礼包',
      content: '新学期课程礼包限时开售，适合基础班学员。',
      icon: 'https://placehold.co/320x180/png?text=School',
      activeMoney: 199900,
      status: 1,
      activityType: 1,
      itemId: 2,
      activeExpireDays: 45,
      beginAt: daysAgo(2),
      endAt: daysFromNow(43),
      url: 'https://example.com/activities/school',
      createdAt: daysAgo(5),
    },
    {
      id: 3,
      title: '暑期成长计划',
      content: '分享活动海报可领取暑期成长资料包。',
      icon: 'https://placehold.co/320x180/png?text=Summer',
      activeMoney: null,
      status: 2,
      activityType: 2,
      itemId: null,
      activeExpireDays: 60,
      beginAt: daysFromNow(30),
      endAt: daysFromNow(90),
      url: 'https://example.com/activities/summer',
      createdAt: daysAgo(1),
    },
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: activity,
      create: activity,
    });
  }
  await resetSerialSequence('Activity');

  const grades = [
    { id: 1, gradeName: '启蒙班', status: 10 },
    { id: 2, gradeName: '基础班', status: 20 },
    { id: 3, gradeName: '进阶班', status: 30 },
    { id: 4, gradeName: '提升班', status: 40 },
  ];

  for (const grade of grades) {
    await prisma.grade.upsert({
      where: { id: grade.id },
      update: grade,
      create: grade,
    });
  }
  await resetSerialSequence('Grade');

  const bookVersions = [
    { id: 1, name: '图图英语启蒙版' },
    { id: 2, name: '图图英语进阶版' },
    { id: 3, name: '图图进阶专项' },
    { id: 4, name: '图图阅读精讲' },
  ];

  for (const version of bookVersions) {
    await prisma.bookVersion.upsert({
      where: { id: version.id },
      update: version,
      create: version,
    });
  }
  await resetSerialSequence('BookVersion');

  const courseBags = [
    {
      id: 1,
      title: '启蒙成长课包',
      icon: 'https://placehold.co/320x180/png?text=Bag+1',
      sort: 10,
      status: 1,
      createdAt: daysAgo(20),
    },
    {
      id: 2,
      title: '阅读专项课包',
      icon: 'https://placehold.co/320x180/png?text=Bag+2',
      sort: 20,
      status: 1,
      createdAt: daysAgo(12),
    },
    {
      id: 3,
      title: '寒假提升课包',
      icon: 'https://placehold.co/320x180/png?text=Bag+3',
      sort: 30,
      status: 2,
      createdAt: daysAgo(5),
    },
  ];

  for (const bag of courseBags) {
    await prisma.courseBag.upsert({
      where: { id: bag.id },
      update: bag,
      create: bag,
    });
  }
  await resetSerialSequence('CourseBag');

  const courseBagCourses = [
    {
      id: 1001,
      bagId: 1,
      name: '拼读启蒙训练营',
      icon: 'https://placehold.co/320x180/png?text=C1001',
      sort: 10,
      status: 1,
      createdAt: daysAgo(18),
    },
    {
      id: 1002,
      bagId: 1,
      name: '自然拼读口语营',
      icon: 'https://placehold.co/320x180/png?text=C1002',
      sort: 20,
      status: 1,
      createdAt: daysAgo(16),
    },
    {
      id: 2001,
      bagId: 2,
      name: '分级阅读表达课',
      icon: 'https://placehold.co/320x180/png?text=C2001',
      sort: 10,
      status: 1,
      createdAt: daysAgo(10),
    },
    {
      id: 2002,
      bagId: 2,
      name: '阅读理解专项班',
      icon: 'https://placehold.co/320x180/png?text=C2002',
      sort: 20,
      status: 2,
      createdAt: daysAgo(8),
    },
    {
      id: 3001,
      bagId: 3,
      name: '寒假冲刺训练营',
      icon: 'https://placehold.co/320x180/png?text=C3001',
      sort: 10,
      status: 1,
      createdAt: daysAgo(4),
    },
  ];

  for (const course of courseBagCourses) {
    await prisma.courseBagCourse.upsert({
      where: { id: course.id },
      update: course,
      create: course,
    });
  }
  await resetSerialSequence('CourseBagCourse');

  const courseBagActivities = [
    {
      id: 5001,
      textbookId: 1001,
      teacher: 'Luna',
      status: 1,
      type: 1,
      saleBeginAt: daysAgo(12),
      saleEndAt: daysAgo(2),
      beginAt: daysAgo(1),
      endAt: daysFromNow(29),
      orgAmt: 299900,
      amt: 199900,
      num: 24,
      chatNo: 'tutu-luna',
      iconDetail: 'https://placehold.co/320x180/png?text=A5001D',
      iconTicket: 'https://placehold.co/320x180/png?text=A5001T',
      createdAt: daysAgo(12),
    },
    {
      id: 5002,
      textbookId: 1001,
      teacher: 'Mika',
      status: 2,
      type: 2,
      saleBeginAt: daysAgo(20),
      saleEndAt: daysAgo(5),
      beginAt: null,
      endAt: null,
      orgAmt: 259900,
      amt: 159900,
      num: 18,
      chatNo: 'tutu-mika',
      iconDetail: 'https://placehold.co/320x180/png?text=A5002D',
      iconTicket: 'https://placehold.co/320x180/png?text=A5002T',
      createdAt: daysAgo(20),
    },
    {
      id: 6001,
      textbookId: 2001,
      teacher: 'Iris',
      status: 1,
      type: 3,
      saleBeginAt: daysAgo(6),
      saleEndAt: daysFromNow(6),
      beginAt: null,
      endAt: null,
      orgAmt: 399900,
      amt: 269900,
      num: 30,
      chatNo: 'tutu-iris',
      iconDetail: 'https://placehold.co/320x180/png?text=A6001D',
      iconTicket: 'https://placehold.co/320x180/png?text=A6001T',
      createdAt: daysAgo(6),
    },
  ];

  for (const activity of courseBagActivities) {
    await prisma.courseBagActivity.upsert({
      where: { id: activity.id },
      update: activity,
      create: activity,
    });
  }

  const courses = [
    {
      textbookId: 101,
      textbookName: 'L1 Starter',
      icon: 'https://placehold.co/160x160/png?text=L1',
      gradeId: 1,
      bookVersionId: 1,
      sortValue: 10,
      canLock: 1,
      status: 1,
    },
    {
      textbookId: 102,
      textbookName: 'L2 Skills',
      icon: 'https://placehold.co/160x160/png?text=L2',
      gradeId: 2,
      bookVersionId: 2,
      sortValue: 20,
      canLock: 1,
      status: 1,
    },
    {
      textbookId: 103,
      textbookName: 'L3 Focus',
      icon: 'https://placehold.co/160x160/png?text=L3',
      gradeId: 3,
      bookVersionId: 3,
      sortValue: 30,
      canLock: 2,
      status: 1,
    },
    {
      textbookId: 104,
      textbookName: 'L4 Master',
      icon: 'https://placehold.co/160x160/png?text=L4',
      gradeId: 4,
      bookVersionId: 4,
      sortValue: 40,
      canLock: 1,
      status: 1,
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { textbookId: course.textbookId },
      update: course,
      create: course,
    });
  }

  const specialCourses = [
    {
      textbookId: 101,
      textbookName: 'L1 Starter 精品启蒙班',
      teacher: 'Luna',
      status: 1,
      type: 1,
      saleBeginAt: daysAgo(15),
      saleEndAt: daysFromNow(7),
      beginAt: daysFromNow(10),
      endAt: daysFromNow(70),
      orgAmt: 299900,
      amt: 199900,
      num: 24,
      chatNo: 'tutu-luna',
      iconDetail: 'https://placehold.co/320x180/png?text=SC101D',
      iconTicket: 'https://placehold.co/320x180/png?text=SC101T',
      createdAt: daysAgo(15),
    },
    {
      textbookId: 102,
      textbookName: 'L2 Skills 精品进阶班',
      teacher: 'Mika',
      status: 1,
      type: 2,
      saleBeginAt: daysAgo(8),
      saleEndAt: daysFromNow(18),
      beginAt: null,
      endAt: null,
      orgAmt: 359900,
      amt: 239900,
      num: 30,
      chatNo: 'tutu-mika',
      iconDetail: 'https://placehold.co/320x180/png?text=SC102D',
      iconTicket: 'https://placehold.co/320x180/png?text=SC102T',
      createdAt: daysAgo(8),
    },
    {
      textbookId: 103,
      textbookName: 'L3 Focus 精品突破班',
      teacher: 'Iris',
      status: 2,
      type: 1,
      saleBeginAt: daysAgo(20),
      saleEndAt: daysAgo(2),
      beginAt: daysAgo(1),
      endAt: daysFromNow(45),
      orgAmt: 399900,
      amt: 269900,
      num: 36,
      chatNo: 'tutu-iris',
      iconDetail: 'https://placehold.co/320x180/png?text=SC103D',
      iconTicket: 'https://placehold.co/320x180/png?text=SC103T',
      createdAt: daysAgo(20),
    },
    {
      textbookId: 104,
      textbookName: 'L4 Master 精品冲刺班',
      teacher: 'Nova',
      status: 1,
      type: 2,
      saleBeginAt: daysAgo(4),
      saleEndAt: daysFromNow(28),
      beginAt: null,
      endAt: null,
      orgAmt: 459900,
      amt: 329900,
      num: 40,
      chatNo: 'tutu-nova',
      iconDetail: 'https://placehold.co/320x180/png?text=SC104D',
      iconTicket: 'https://placehold.co/320x180/png?text=SC104T',
      createdAt: daysAgo(4),
    },
  ];

  for (const course of specialCourses) {
    await prisma.specialCourse.upsert({
      where: { textbookId: course.textbookId },
      update: course,
      create: course,
    });
  }

  const orderSeeds = [
    {
      orderNo: 'TUTU202604080001',
      memberId: memberIdMap.get(100001)!,
      itemId: 1,
      itemName: '月度会员',
      orderAmount: 2999,
      payType: 1,
      orderStatus: 2,
      payTime: daysAgo(17),
      outNo: 'WX202604080001',
      cancelReason: '',
      activityId: 1,
      textbookId: 101,
      createdAt: daysAgo(18),
    },
    {
      orderNo: 'TUTU202604080002',
      memberId: memberIdMap.get(100002)!,
      itemId: 2,
      itemName: '季度会员',
      orderAmount: 6999,
      payType: 2,
      orderStatus: 2,
      payTime: daysAgo(55),
      outNo: 'ALI202604080002',
      cancelReason: '',
      activityId: 2,
      textbookId: 102,
      createdAt: daysAgo(56),
    },
    {
      orderNo: 'TUTU202604080003',
      memberId: memberIdMap.get(100003)!,
      itemId: 1,
      itemName: '月度会员',
      orderAmount: 2999,
      payType: 1,
      orderStatus: 3,
      payTime: null,
      outNo: '',
      cancelReason: '用户主动取消',
      activityId: 1,
      textbookId: null,
      createdAt: daysAgo(9),
    },
    {
      orderNo: 'TUTU202604080004',
      memberId: memberIdMap.get(100004)!,
      itemId: 3,
      itemName: '年度会员',
      orderAmount: 19999,
      payType: 1,
      orderStatus: 2,
      payTime: daysAgo(158),
      outNo: 'WX202604080004',
      cancelReason: '',
      activityId: 3,
      textbookId: 104,
      createdAt: daysAgo(160),
    },
    {
      orderNo: 'TUTU202604080005',
      memberId: memberIdMap.get(100005)!,
      itemId: 1,
      itemName: '月度会员',
      orderAmount: 2999,
      payType: 2,
      orderStatus: 1,
      payTime: null,
      outNo: '',
      cancelReason: '',
      activityId: null,
      textbookId: null,
      createdAt: daysAgo(1),
    },
    {
      orderNo: 'TUTU202604080006',
      memberId: memberIdMap.get(100006)!,
      itemId: 2,
      itemName: '季度会员',
      orderAmount: 6999,
      payType: 1,
      orderStatus: 4,
      payTime: null,
      outNo: '',
      cancelReason: '超时未支付自动关闭',
      activityId: 2,
      textbookId: 103,
      createdAt: daysAgo(32),
    },
  ];

  for (const order of orderSeeds) {
    await prisma.order.upsert({
      where: { orderNo: order.orderNo },
      update: order,
      create: order,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
