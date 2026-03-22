import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsPositive } from 'class-validator';
import { PriorityDto } from './create-todo.dto';

export class ListTodoDto {
  @IsOptional()
  @IsEnum(PriorityDto)
  priority?: PriorityDto;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsPositive()
  limit?: number = 10;
}