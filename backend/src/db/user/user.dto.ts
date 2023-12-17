import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateUserInfosBody {

  @ApiProperty({ description: 'Username displayed' })
  @IsString()
  @IsOptional()
  username: string

  @ApiProperty({ description: 'Image of the user' })
  @IsString()
  @IsOptional()
  image: string
  
  @ApiProperty({ description: 'Email of the user' })
  @IsString()
  @IsOptional()
  email: string
}

export class SendFriendRequestBody {
  @ApiProperty({ description: 'User to send the request to' })
  @IsNumber()
  user_id: number
}
export class AcceptFriendRequestBody {
  @ApiProperty({ description: 'Id of the request' })
  @IsNumber()
  id: number
}
export class DenyFriendRequestBody {
  @ApiProperty({ description: 'Id of the request' })
  @IsNumber()
  id: number
}
export class RemoveFriendBody {
  @ApiProperty({ description: 'Id of the user to remove' })
  @IsNumber()
  user_id: number
}

export class SendPlayRequestBody {
  @ApiProperty({ description: 'User to send the request to' })
  @IsNumber()
  user_id: number
}
export class AcceptPlayRequestBody {
  @ApiProperty({ description: 'Id of the request' })
  @IsNumber()
  id: number
}
export class DenyPlayRequestBody {
  @ApiProperty({ description: 'Id of the request' })
  @IsNumber()
  id: number
}


export class BlockFriendBody {
  @ApiProperty({ description: 'Id of the user to block' })
  @IsNumber()
  user_id: number
}