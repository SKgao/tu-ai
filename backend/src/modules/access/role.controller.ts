import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { SuperAdminOnly } from '../auth/roles.decorator';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RoleService } from './role.service';

@Controller('role')
@UseGuards(TokenAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('list')
  @SuperAdminOnly()
  list(@Body() payload: unknown) {
    return this.roleService.listRoles(payload);
  }

  @Post('add')
  @SuperAdminOnly()
  add(@Body() payload: unknown) {
    return this.roleService.createRole(payload);
  }

  @Post('delete')
  @SuperAdminOnly()
  remove(@Body() payload: unknown) {
    return this.roleService.deleteRole(payload);
  }

  // 返回当前登录角色自己的菜单，供前端构建导航使用，因此不限制角色。
  @Post('menus')
  currentMenus(@Req() request: { user: { roleId: number } }) {
    return this.roleService.getCurrentRoleMenus(Number(request.user.roleId));
  }

  @Get('menus/:id')
  @SuperAdminOnly()
  menus(@Param('id') id: string) {
    return this.roleService.getRoleMenus(Number(id));
  }

  // 授权变更属于最高敏感操作：此前任意登录用户都能借此给自己提权。
  @Post('setAuthority')
  @SuperAdminOnly()
  setAuthority(@Body() payload: { roleId?: number; menuIds?: number[] }) {
    return this.roleService.setRoleAuthorities(payload);
  }
}
