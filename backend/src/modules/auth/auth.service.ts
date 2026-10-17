import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';
import { getJwtSecret } from '../../common/env';
import { toOptionalString } from '../../common/parsers';
import { hashPassword, isPasswordHash, verifyPassword } from '../../common/password';
import { ok } from '../../common/response';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

type AuthTokenPayload = {
  sub: number;
  account: string;
  roleId: number;
  /** token 版本号，退出登录后自增，用于让旧 token 立刻失效 */
  ver?: number;
  iat?: number;
  exp?: number;
};

export type AuthUser = AuthTokenPayload;

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

    return ok(
      {
        ...this.serializeUser(user),
        token: this.signToken(user),
      },
      '登录成功',
    );
  }

  /**
   * 校验 token 并返回**当前库里最新的**用户身份。
   *
   * 这里刻意不只验签名：签名有效不代表账号仍然可用。每次请求都回查数据库，
   * 因此下面这些动作都能立即生效，而不必等 token 过期（默认 7 天）：
   *  - 禁用 / 删除账号
   *  - 调整角色（roleId 以库里为准，不再信任 token 里的旧值）
   *  - 用户主动退出登录（tokenVersion 自增，旧 token 全部作废）
   */
  async verifyToken(token: string): Promise<AuthUser> {
    // 必须在 try 之外读取：配置缺失属于服务端错误，
    // 不能被下面的 catch 吞成“登录已失效”。
    const secret = getJwtSecret();

    let payload: Partial<AuthTokenPayload>;
    try {
      payload = jwt.verify(token, secret) as unknown as Partial<AuthTokenPayload>;
    } catch {
      throw new UnauthorizedException('登录已失效');
    }

    const userId = Number(payload?.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException('登录已失效');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, account: true, roleId: true, status: true, tokenVersion: true },
    });

    if (!user) {
      throw new UnauthorizedException('登录已失效');
    }
    if (user.status === 2) {
      throw new UnauthorizedException('账号已被禁用');
    }
    if (user.status !== 1) {
      throw new UnauthorizedException('登录已失效');
    }
    if (Number(payload?.ver ?? 0) !== user.tokenVersion) {
      throw new UnauthorizedException('登录已失效');
    }

    // 角色以数据库为准：降级/提权都立刻生效
    return {
      sub: user.id,
      account: user.account,
      roleId: user.roleId,
      ver: user.tokenVersion,
    };
  }

  /**
   * 退出登录：自增 tokenVersion，使该用户已签发的所有 token 立即作废。
   *
   * 纯 JWT 无状态，没有这个版本号的话“退出登录”只是前端删掉本地 token，
   * 服务端仍然认旧 token 直到过期。
   */
  async logout(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  private signToken(user: Pick<User, 'id' | 'account' | 'roleId' | 'tokenVersion'>) {
    const secret = getJwtSecret();
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
    return jwt.sign(
      {
        sub: user.id,
        account: user.account,
        roleId: user.roleId,
        ver: user.tokenVersion,
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
