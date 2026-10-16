import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';
import { getJwtSecret } from '../../common/env';
import { toOptionalString } from '../../common/parsers';
import { hashPassword, isPasswordHash, verifyPassword } from '../../common/password';
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
    const identity = toOptionalString(payload.account) || toOptionalString(payload.username) || '';
    const password = toOptionalString(payload.password) || '';

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

    if (!user) {
      return {
        code: 1,
        message: '用户名或密码错误',
        data: null,
      };
    }

    if (user.status === 2) {
      return {
        code: 1,
        message: '账号已被禁用',
        data: null,
      };
    }

    if (user.status !== 1) {
      return {
        code: 1,
        message: '用户名或密码错误',
        data: null,
      };
    }

    const passwordMatched = await verifyPassword(password, user.passwordHash);
    if (!passwordMatched) {
      return {
        code: 1,
        message: '用户名或密码错误',
        data: null,
      };
    }

    if (!isPasswordHash(user.passwordHash)) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: await hashPassword(password),
        },
      });
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
    // 必须在 try 之外读取：配置缺失属于服务端错误，
    // 不能被下面的 catch 吞成“登录已失效”。
    const secret = getJwtSecret();

    try {
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
    const secret = getJwtSecret();
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
