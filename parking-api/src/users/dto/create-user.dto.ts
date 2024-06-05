import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { trimString } from "src/common/validations/validations";

  export class CreateUserDto {
    @ApiProperty({ example: 'John', description: 'The first name of the user' })
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(1, { message: 'name must have at least 1 digits' })
    @Matches(/^[a-zA-Z]+$/, { message: 'name must contain only letters' })
    name: string;
  
    @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(1, { message: 'lastname must have at least 1 digits' })
    @IsOptional()
    @Matches(/^[a-zA-Z]+$/, { message: 'lastname must contain only letters' })
    lastname?: string;
  
    @ApiProperty({ example: '1234567890', description: 'The DNI of the user' })
    @IsString()
    @MinLength(10, { message: 'dni must have at least 10 digits' })
    @Matches(/^\d+$/, { message: 'dni must contain only numbers' })
    dni: string;
  
    @ApiProperty({ example: '1234567890', description: 'The phone number of the user' })
    @IsString()
    @MinLength(10, { message: 'phone number must have at least 10 digits' })
    @Matches(/^\d+$/, { message: 'phone must contain only numbers' })
    phone: string;
  
    @ApiProperty({ example: 'john.doe@example.com', description: 'The email of the user' })
    @IsEmail({}, { message: 'email is not valid' })
    email: string;
  
    @ApiProperty({ example: 'password123', description: 'The password of the user' })
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(5, { message: 'password must have at least 5 digits' })
    password: string;
}
