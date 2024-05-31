import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { trimString } from "src/common/validations/validations";

  export class CreateUserDto {
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(1, { message: 'name must have at least 1 digits' })
    @Matches(/^[a-zA-Z]+$/, { message: 'name must contain only letters' })
    name: string;
  
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(1, { message: 'lastname must have at least 1 digits' })
    @IsOptional()
    @Matches(/^[a-zA-Z]+$/, { message: 'lastname must contain only letters' })
    lastname?: string;
  
    @IsString()
    @MinLength(10, { message: 'dni must have at least 10 digits' })
    @Matches(/^\d+$/, { message: 'dni must contain only numbers' })
    dni: string;
  
    @IsString()
    @MinLength(10, { message: 'phone number must have at least 10 digits' })
    @Matches(/^\d+$/, { message: 'phone must contain only numbers' })
    phone: string;
  
    @IsEmail({}, { message: 'email is not valid' })
    email: string;
  
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(5, { message: 'password must have at least 5 digits' })
    password: string;
}
