import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './roles.decorator';

/**
 * 身份认证守卫：从 `Authorization: Bearer <token>` 或 `token` 头取 token，
 * 校验并查询数据库中的最新用户状态，挂到 `request.user` 上。
 *
 * 该守卫通过 `APP_GUARD` **全局注册**，因此默认所有路由都需要登录；
 * 只有显式标注 `@Public()` 的接口（目前仅登录）会跳过。
 */
@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const headerToken = request.headers.token;
    const token =
      typeof authorization === 'string' && authorization.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length).trim()
        : headerToken;

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('请先登录');
    }

    request.user = await this.authService.verifyToken(token);
    return true;
  }
}
