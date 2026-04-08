import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RoleService } from './role.service';

@Controller('role')
@UseGuards(TokenAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('list')
  list(@Body() payload: unknown) {
    return this.roleService.listRoles(payload);
  }

  @Post('add')
  add(@Body() payload: unknown) {
    return this.roleService.createRole(payload);
  }

  @Post('delete')
  remove(@Body() payload: unknown) {
    return this.roleService.deleteRole(payload);
  }

  @Post('menus')
  currentMenus(@Req() request: { user: { roleId: number } }) {
    return this.roleService.getCurrentRoleMenus(Number(request.user.roleId));
  }

  @Get('menus/:id')
  menus(@Param('id') id: string) {
    return this.roleService.getRoleMenus(Number(id));
  }

  @Post('setAuthority')
  setAuthority(@Body() payload: { roleId?: number; menuIds?: number[] }) {
    return this.roleService.setRoleAuthorities(payload);
  }
}
