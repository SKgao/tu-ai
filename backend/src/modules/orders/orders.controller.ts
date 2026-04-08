import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { OrdersService } from './orders.service';

@Controller()
@UseGuards(TokenAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('order/list')
  listOrders(@Body() payload: Record<string, unknown>) {
    return this.ordersService.listOrders(payload);
  }

  @Get('activity/list/combox')
  listActivityOptions() {
    return this.ordersService.listActivityOptions();
  }

  @Post('course/list/down')
  listCourseOptions() {
    return this.ordersService.listCourseOptions();
  }
}
