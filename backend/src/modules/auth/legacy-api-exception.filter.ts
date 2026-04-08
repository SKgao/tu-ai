import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class LegacyApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : (payload as { message?: string | string[] })?.message || exception.message;

      response.status(HttpStatus.OK).json({
        code: status === HttpStatus.UNAUTHORIZED ? 45 : 1,
        message: Array.isArray(message) ? message[0] : message || '请求失败',
        data: null,
      });
      return;
    }

    console.error(exception);
    response.status(HttpStatus.OK).json({
      code: 1,
      message: '服务异常',
      data: null,
    });
  }
}
