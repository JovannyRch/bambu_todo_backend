import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum PriorityDto {
  baja = 'baja',
  media = 'media',
  alta = 'alta',
}

export class CreateTodoDto {
  @IsString()
  @MinLength(1)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsEnum(PriorityDto)
  prioridad: PriorityDto;

  @IsOptional()
  @IsBoolean()
  finalizada?: boolean;
}