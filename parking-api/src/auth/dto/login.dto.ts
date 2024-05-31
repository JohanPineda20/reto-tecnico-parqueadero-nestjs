import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";
import { trimString } from "src/common/validations/validations";

export class LoginDto{
    @IsEmail({}, { message: 'the email is not valid' })
    email: string;
    @Transform(({ value }) => trimString(value))
    @IsString()
    @MinLength(5, { message: 'the password must have at least 5 digits' })
    password: string;
}