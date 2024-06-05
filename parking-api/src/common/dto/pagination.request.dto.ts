import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationRequestDto {
    @Type(()=> Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @Type(()=> Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    size?: number = 10;
  }