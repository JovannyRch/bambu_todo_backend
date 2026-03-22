import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum PriorityDto {
  baja = 'baja',
  media = 'media',
  alta = 'alta',
}

export class CreateTodoDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(PriorityDto)
  priority: PriorityDto;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}