import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { TokenAuthGuard } from './token-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TokenAuthGuard, RolesGuard],
  exports: [AuthService, TokenAuthGuard, RolesGuard],
})
export class AuthModule {}
