import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { ListOrdersDto } from './dto/list-orders.dto';
import { OrdersService } from './orders.service';

@Controller()
@UseGuards(TokenAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('order/list')
  listOrders(@Body() payload: ListOrdersDto) {
    return this.ordersService.listOrders(payload);
  }

  @Post('course/order/list')
  listCourseOrders(@Body() payload: ListOrdersDto) {
    return this.ordersService.listCourseOrders(payload);
  }

  @Post('course/list/down')
  listCourseOptions() {
    return this.ordersService.listCourseOptions();
  }
}
