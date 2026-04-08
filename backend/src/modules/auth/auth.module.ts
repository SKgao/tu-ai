import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenAuthGuard } from './token-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TokenAuthGuard],
  exports: [AuthService, TokenAuthGuard],
})
export class AuthModule {}
