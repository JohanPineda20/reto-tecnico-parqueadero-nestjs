import { Transform } from "class-transformer"
import { IsInt, IsPositive, IsString, Matches, Min } from "class-validator"
import { trimString } from "src/common/validations/validations"

export class CreateParkingVehicleDto {
    @Transform(({ value }) => {
        value = trimString(value)
        return value.toUpperCase()
    })
    @IsString()
    @Matches(/^[a-zA-Z0-9]{6}$/, { message: "license plate must consist of exactly 6 characters. Special characters and the letter 'ñ' are not permitted."})
    licensePlate: string
    
    @IsInt({ message: 'parking_id must be a int' })
    @IsPositive({ message: 'parking_id must be a positive number' })
    @Min(1, { message: 'parking_id must be greater than or equal to 1' })
    parkingId: number
}
