import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum } from "class-validator"
import { AccessLevel } from "./conversation_access_level.enum"

export class ConversationCreateParams {
  @ApiProperty({ description: 'Title of the conversation' })
  @IsString()
  title: string
  
  @ApiProperty({ description: 'Access level. PROTECTED will require a password', enum:AccessLevel, examples: Object.keys(AccessLevel)})
  @IsEnum(AccessLevel)
  access_level: AccessLevel
  
  @ApiProperty({ description: 'Password of the conversation (empty if no password)' })
  @IsOptional()
  @IsString()
  password?: string
}

export class ConversationJoinParams {
  @ApiProperty({ description: 'Id of the conversation' })
  @IsNumber()
  id: number
  
  @ApiProperty({ description: 'Optional password if conversation is protected' })
  @IsString()
  @IsOptional()
  password?:string
}

export class ConversationLeaveParams {
  @ApiProperty({ description: 'Id of the conversation' })
  @IsNumber()
  id: number
}

export class PromoteParams {
  @ApiProperty({ description: 'Id of the conversation user to promote' })
  @IsNumber()
  conversation_user_id: number
}

export class KickParams {
  @ApiProperty({ description: 'Id of the conversation user to kick' })
  @IsNumber()
  conversation_user_id: number
}

export class MuteParams {
  @ApiProperty({ description: 'Id of the conversation user to mute' })
  @IsNumber()
  conversation_user_id: number
  
  @ApiProperty({
    description: 'Duration of the mute',
    examples: ['2042-12-31T23:42:42', '1d', '2y1d3m', 'forever']
  })
  @IsString()
  duration: string | 'forever'
}

export class BanParams {

  @ApiProperty({ description: 'Id of the conversation user to ban' })
  @IsNumber()
  conversation_user_id: number

  @ApiProperty({
    description: 'Duration of the ban',
    examples: ['2042-12-31T23:42:42', '1d', '2y1d3m', 'forever']
  })
  @IsString()
  duration: string | 'forever'
}