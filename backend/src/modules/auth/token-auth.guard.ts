import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.token;

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('请先登录');
    }

    request.user = this.authService.verifyToken(token);
    return true;
  }
}
