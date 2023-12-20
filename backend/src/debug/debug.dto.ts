import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"

export class AddUserParams {
	@ApiProperty({ description: 'id' })
	@IsNumber()
	id: number

	@ApiProperty({ description: 'username' })
	@IsString()
	username: string

	@ApiProperty({ description: 'image' })
	@IsString()
	image: string

	@ApiProperty({ description: 'email' })
	@IsString()
	email: string
}

export class LogAsParams {
	@ApiProperty({ description: 'Username of user' })
	@IsString()
	username: string
}

export class NewMessageParams {
	@ApiProperty({ description: 'User id' })
	@IsNumber()
	user_id: number

	@ApiProperty({ description: 'Message\'s content' })
	@IsNumber()
	content: string

	@ApiProperty({ description: 'Conv name' })
	@IsString()
	conversation_name: string
}