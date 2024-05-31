import { Transform } from "class-transformer";
import { IsInt, IsNumber, IsPositive, IsString, Min, MinLength } from "class-validator";
import { trimString } from "src/common/validations/validations";

export class CreateParkingDto {
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(1, { message: 'name must have at least 1 digits' })
    name: string;
    
    @IsInt({ message: "capacity must be a int" })
    @IsPositive({ message: "capacity must be a positive number" })
    @Min(1, { message: "capacity must be greater than or equal to 1" })
    capacity: number;
    
    @IsNumber({}, { message: "cost per hour must be a number" })
    @IsPositive({ message: "cost per hour must be a positive number" })
    @Min(0.1, { message: "cost per hour must be greater than or equal to 0.1" })
    costPerHour: number;
    
    @IsInt({ message: "user_id must be a int" })
    @IsPositive({ message: "user_id must be a positive number" })
    @Min(1, { message: "user_id must be greater than or equal to 1" })
    userId: number;
      
}
