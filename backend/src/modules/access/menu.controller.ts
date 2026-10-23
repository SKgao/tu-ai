import { Body, Controller, Post, Req } from '@nestjs/common';
import { SuperAdminOnly } from '../auth/roles.decorator';
import { MenuService } from './menu.service';

type AuthenticatedRequest = {
  user?: {
    sub?: number;
    roleId?: number;
  };
};

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /** 当前登录用户的侧边栏菜单树，所有已登录用户都可访问。 */
  @Post('my')
  myMenus(@Req() request: AuthenticatedRequest) {
    return this.menuService.getCurrentUserMenus(
      Number(request.user?.sub),
      Number(request.user?.roleId),
    );
  }

  @Post('list')
  @SuperAdminOnly()
  list(@Body() payload: { menuName?: string; pageNum?: number; pageSize?: number }) {
    return this.menuService.listMenus(payload);
  }

  @Post('tree')
  @SuperAdminOnly()
  tree() {
    return this.menuService.getMenuTree();
  }

  @Post('add')
  @SuperAdminOnly()
  add(
    @Body()
    payload: {
      menuName?: string;
      parentId?: number;
      sortValue?: number;
      path?: string;
      icon?: string;
      menuScope?: number;
      url?: string;
      status?: number;
    },
  ) {
    return this.menuService.createMenu(payload);
  }

  @Post('update')
  @SuperAdminOnly()
  update(
    @Body()
    payload: {
      id?: number;
      menuName?: string;
      parentId?: number;
      sortValue?: number;
      path?: string;
      icon?: string;
      menuScope?: number;
      url?: string;
      status?: number;
    },
  ) {
    return this.menuService.updateMenu(payload);
  }

  @Post('delete')
  @SuperAdminOnly()
  remove(@Body() payload: unknown) {
    return this.menuService.deleteMenu(payload);
  }

  /** 用户授权：返回菜单树与该用户已勾选的节点。 */
  @Post('user')
  @SuperAdminOnly()
  userMenus(@Body() payload: { userId?: number; id?: number }) {
    return this.menuService.getUserMenuAuth(
      Number(payload.userId ?? payload.id ?? 0),
    );
  }

  /** 用户授权：保存用户可见菜单（只传子节点也会自动补父级）。 */
  @Post('user/update')
  @SuperAdminOnly()
  setUserMenus(@Body() payload: { userId?: number; id?: number; menuIds?: number[] }) {
    return this.menuService.setUserMenuAuth(payload);
  }
}
