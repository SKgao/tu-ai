import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './modules/auth/roles.guard';
import { TokenAuthGuard } from './modules/auth/token-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { AccessModule } from './modules/access/access.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { BooksModule } from './modules/books/books.module';
import { CourseBagsModule } from './modules/course-bags/course-bags.module';
import { UsersModule } from './modules/users/users.module';
import { MembersModule } from './modules/members/members.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PartsModule } from './modules/parts/parts.module';
import { PassesModule } from './modules/passes/passes.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SourceMaterialsModule } from './modules/source-materials/source-materials.module';
import { SpecialCoursesModule } from './modules/special-courses/special-courses.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { UnitsModule } from './modules/units/units.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AccessModule,
    ActivitiesModule,
    BooksModule,
    CourseBagsModule,
    SpecialCoursesModule,
    UnitsModule,
    PartsModule,
    PassesModule,
    SessionsModule,
    SourceMaterialsModule,
    SubjectsModule,
    UsersModule,
    MembersModule,
    OrdersModule,
  ],
  providers: [
    // 全局守卫：注册顺序即执行顺序，认证必须在授权之前。
    // 这样任何新增 controller 都默认受保护，不会再出现“忘挂 @UseGuards”的漏网接口；
    // 需要公开的接口显式标注 `@Public()`。
    { provide: APP_GUARD, useClass: TokenAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
