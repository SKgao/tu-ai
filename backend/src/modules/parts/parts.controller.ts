import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreatePartDto } from './dto/create-part.dto';
import { ListPartsDto } from './dto/list-parts.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartsService } from './parts.service';

@Controller()
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post('part/list')
  listParts(@Body() payload: ListPartsDto) {
    return this.partsService.listParts(payload);
  }

  @Post('part/add')
  createPart(@Body() payload: CreatePartDto) {
    return this.partsService.createPart(payload);
  }

  @Post('part/update')
  updatePart(@Body() payload: UpdatePartDto) {
    return this.partsService.updatePart(payload);
  }

  @Post('part/del/:id')
  deletePart(@Param('id', ParseIntPipe) id: number) {
    return this.partsService.deletePart(id);
  }
}
