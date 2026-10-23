import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { syncMenus, syncUserMenus } from './menu-seed';

/**
 * 只同步菜单数据，不触碰业务数据：
 *   npm run db:sync-menus
 *
 * 用于把代码里的 `MENU_DEFINITIONS` 写入数据库，并按内置角色补齐用户默认授权。
 */
const prisma = new PrismaClient();

async function main() {
  await syncMenus(prisma);
  // 首次执行时为空表，按角色默认菜单初始化；已有自定义授权时不会被覆盖。
  await syncUserMenus(prisma);
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
