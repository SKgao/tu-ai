import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { UsersService } from './users.service';

const uploadDir = join(process.cwd(), 'uploads');
mkdirSync(uploadDir, { recursive: true });

function buildUploadFilename(originalName: string) {
  const extension = extname(originalName || '') || '.png';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;
}

@Controller()
@UseGuards(TokenAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('user/list')
  listUsers(@Body() payload: Record<string, unknown>) {
    return this.usersService.listUsers(payload);
  }

  @Post('user/add')
  addUser(@Body() payload: Record<string, unknown>) {
    return this.usersService.createUser(payload);
  }

  @Post('user/update')
  updateUser(@Body() payload: Record<string, unknown>) {
    return this.usersService.updateUser(payload);
  }

  @Post('user/delete')
  deleteUser(@Body() payload: unknown) {
    return this.usersService.deleteUser(payload);
  }

  @Post('user/forbidden')
  forbidUser(@Body() payload: unknown) {
    return this.usersService.forbidUser(payload);
  }

  @Post('user/using')
  enableUser(@Body() payload: unknown) {
    return this.usersService.enableUser(payload);
  }

  @Post('file/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_, file, callback) => {
          callback(null, buildUploadFilename(file.originalname));
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: { protocol: string; get(header: string): string | undefined },
  ) {
    const host = request.get('host') || 'localhost:3000';
    return {
      code: 0,
      message: '上传成功',
      data: `${request.protocol}://${host}/uploads/${file.filename}`,
    };
  }
}
