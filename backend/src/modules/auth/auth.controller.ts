import { Body, Controller, Post, Req } from '@nestjs/common';
import { ok } from '../../common/response';
import { AuthService, type AuthUser } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './roles.decorator';

type AuthenticatedRequest = {
  user?: AuthUser;
};

@Controller('user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 登录：全站唯一的公开接口。
   * 守卫是全局注册的，所以必须显式 `@Public()` 否则会被自己的守卫拦掉。
   */
  @Post('login')
  @Public()
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  /**
   * 退出登录：自增 tokenVersion，让该用户已签发的 token 全部立即失效。
   * 需要带 token（由全局守卫校验），否则无法知道要注销谁。
   */
  @Post('logout')
  async logout(@Req() request: AuthenticatedRequest) {
    const userId = Number(request.user?.sub);
    if (Number.isInteger(userId) && userId > 0) {
      await this.authService.logout(userId);
    }

    return ok(true, '退出成功');
  }
}
