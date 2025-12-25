import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CursorPaginationDto {
  @Min(10)
  @Max(100)
  @IsOptional()
  @IsNumber()
  limit: number = 20;

  @IsOptional()
  cursor?: number;
}
