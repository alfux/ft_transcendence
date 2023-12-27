import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum } from "class-validator"

/*
export class ConversationCreateParams {
	@ApiProperty({ description: 'Title of the conversation' })
	@IsString()
	title: string

	@ApiProperty({ description: 'Access level. PROTECTED will require a password', enum: AccessLevel, examples: Object.keys(AccessLevel) })
	@IsEnum(AccessLevel)
	access_level: AccessLevel

	@ApiProperty({ description: 'Password of the conversation (empty if no password)' })
	@IsOptional()
	@IsString()
	password?: string
}
*/