import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  account!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsInt({ message: '请选择角色' })
  @Min(1, { message: '请选择角色' })
  roleid!: number;
}
