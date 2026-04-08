import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

type AuthTokenPayload = {
  sub: number;
  account: string;
  roleId: number;
  iat?: number;
  exp?: number;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(payload: LoginDto) {
    const identity = payload.account?.trim() || payload.username?.trim() || '';
    const password = payload.password?.trim() || '';

    if (!identity || !password) {
      return {
        code: 1,
        message: '请输入用户名和密码',
        data: null,
      };
    }

    const user = await this.prisma.user.findFirst({
      where: {
        account: identity,
      },
    });

    if (!user || user.passwordHash !== password || user.status !== 1) {
      return {
        code: 1,
        message: '用户名或密码错误',
        data: null,
      };
    }

    return {
      code: 0,
      message: '登录成功',
      data: {
        ...this.serializeUser(user),
        token: this.signToken(user),
      },
    };
  }

  verifyToken(token: string) {
    try {
      const secret = process.env.JWT_SECRET || 'tutu-admin-local-secret';
      const payload = jwt.verify(token, secret) as unknown as Partial<AuthTokenPayload>;
      if (!payload?.account || !payload?.roleId || !payload?.sub) {
        throw new UnauthorizedException('登录已失效');
      }
      return payload as AuthTokenPayload;
    } catch {
      throw new UnauthorizedException('登录已失效');
    }
  }

  private signToken(user: Pick<User, 'id' | 'account' | 'roleId'>) {
    const secret = process.env.JWT_SECRET || 'tutu-admin-local-secret';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
    return jwt.sign(
      {
        sub: user.id,
        account: user.account,
        roleId: user.roleId,
      },
      secret,
      { expiresIn },
    );
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      account: user.account,
      username: user.username,
      avatar: user.avatar || '',
      roleId: user.roleId,
    };
  }
}
