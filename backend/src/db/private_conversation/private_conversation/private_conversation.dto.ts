import { ApiProperty } from "@nestjs/swagger"
import { IsNumber } from "class-validator"

export class NewPrivateConvParams {
	@ApiProperty({ description: "User id to create a new private conversation with" })
	@IsNumber()
	user_id: number
}