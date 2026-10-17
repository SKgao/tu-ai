import { Body, Controller, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { ListUnitsDto } from './dto/list-units.dto';
import { LockUnitDto } from './dto/lock-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitsService } from './units.service';

@Controller()
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post('unit/list')
  listUnits(@Body() payload: ListUnitsDto) {
    return this.unitsService.listUnits(payload);
  }

  @Post('unit/add')
  createUnit(@Body() payload: CreateUnitDto) {
    return this.unitsService.createUnit(payload);
  }

  @Post('unit/update')
  updateUnit(@Body() payload: UpdateUnitDto) {
    return this.unitsService.updateUnit(payload);
  }

  // 写操作统一使用 POST，路径形态与前端保持一致。
  @Post('unit/del/:id')
  deleteUnit(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.deleteUnit(id);
  }

  // 锁定参数走 query：?unitId=1&canLock=2
  @Post('unit/lock')
  lockUnit(@Query() payload: LockUnitDto) {
    return this.unitsService.lockUnit(payload);
  }
}
