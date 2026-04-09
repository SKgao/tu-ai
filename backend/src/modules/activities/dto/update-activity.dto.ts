import { IsInt } from 'class-validator';
import { CreateActivityDto } from './create-activity.dto';

export class UpdateActivityDto extends CreateActivityDto {
  @IsInt()
  id!: number;
}
