import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class AuthenticateParams {
	@ApiProperty({ description: 'The 2FA code from the authentication app' })
	@IsString()
	code: string
}