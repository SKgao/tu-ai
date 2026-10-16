import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { SuperAdminOnly } from '../auth/roles.decorator';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { MenuService } from './menu.service';

// 菜单维护整体只对超级管理员开放。
@Controller('menu')
@UseGuards(TokenAuthGuard, RolesGuard)
@SuperAdminOnly()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('list')
  list(@Body() payload: { menuName?: string; pageNum?: number; pageSize?: number }) {
    return this.menuService.listMenus(payload);
  }

  @Post('add')
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
  remove(@Body() payload: unknown) {
    return this.menuService.deleteMenu(payload);
  }
}
