import { Req, Controller, Get, Post, Body, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger'

import { User } from './user.entity'
import { UserService } from "./user.service"
import { Request } from 'src/auth'
import { Route } from 'src/route'


class SendFriendRequestBody {
  @ApiProperty({ description: 'Message of the request'})
  content:string
  @ApiProperty({ description: 'User to send the request to', properties: {
    user_id: { type: 'number', description: 'User ID' },
    username: { type: 'string', description: 'Username' },
  }})
  to: {
    user_id?: number,
    username?: string,
  }
}

class AcceptFriendRequestBody {
  @ApiProperty({ description: 'Id of the request'})
  id:number
}
class DenyFriendRequestBody {
  @ApiProperty({ description: 'Id of the request'})
  id:number
}

class RemoveFriendBody {
  @ApiProperty({ description: 'Id of the user to remove'})
  user_id:number
}

class BlockFriendBody {
  @ApiProperty({ description: 'Id of the user to block'})
  user_id:number
}

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {

  constructor(
    private userService: UserService
  )  { }

  @Route({
    method:Get('me'),
    description:{ summary:'Get user info', description:'Returns authenticated user\'s info' },
    responses: [{status:200, description:'Found user successfully'}]
  })
  getMe(@Req() req: Request) {
    return this.userService.getUser({id:req.user.id})
  }

  @Route({
    method:Get('/'),
    description:{ summary:'Get all users info', description:'Returns all users info' },
    responses: [{status:200, description:'Found user successfully'}]
  })
  getAllUsers() {
    return this.userService.getUsers()
  }


  @Route({
    method:Get('friend_request'),
    description:{summary:'Get all friend requests', description:'Get all friend requests'},
  })
  async get_friend_request(@Req() req: Request) {
    const user = await this.userService.getUser({id:req.user.id}, [
      'friends_requests_recv',
      'friends_requests_recv.sender',
      'friends_requests_recv.receiver',
      
      'friends_requests_sent',
      'friends_requests_sent.sender',
      'friends_requests_sent.receiver'
    ])
    return {
      received:user.friends_requests_recv,
      sent:user.friends_requests_sent
    }
  }

  @Route({
    method:Post('friend_request'),
    description:{summary:'Sends a friend request', description:'Sends a friend request'},
  })
  async send_friend_request(@Req() req: Request, @Body() body: SendFriendRequestBody) {
    if ((!body.to.user_id && !body.to.username))
      throw new HttpException("Missing user_id/username", HttpStatus.BAD_REQUEST)
    const from = await this.userService.getUser({id:req.user.id})
    const to = await this.userService.getUser({id:body.to.user_id, username:body.to.username})
    if (from.id === to.id)
      throw new HttpException("Can't add yourself as a friend, sry", HttpStatus.BAD_REQUEST)
    return this.userService.sendFriendRequest(from, to, body.content)
  }

  @Route({
    method:Post('friend_request_accept'),
    description:{summary:'Accepts a friend request', description:'Accepts a friend request'},
  })
  async accept_friend_request(@Req() req: Request, @Body() body: AcceptFriendRequestBody) {
    try {
      await this.userService.getUser({id:req.user.id, friends_requests_recv:{id:body.id}})
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpException("Request not foud or not allowed", HttpStatus.BAD_REQUEST)
    }

    this.userService.acceptFriendRequest(body.id)
  }

  @Route({
    method:Post('friend_request_deny'),
    description:{summary:'Deny a friend request', description:'Deny a friend request'},
  })
  async deny_friend_request(@Req() req: Request, @Body() body: DenyFriendRequestBody) {
    try {
      await this.userService.getUser({id:req.user.id, friends_requests_recv:{id:body.id}})
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpException("Request not foud or not allowed", HttpStatus.BAD_REQUEST)
    }

    this.userService.denyFriendRequest(body.id)
  }

  @Route({
    method:Get('friends'),
    description:{summary:'Returns the friend list', description:'Returns the friend list'}
  })
  async get_friends_list(@Req() req: Request) {
    const user = await this.userService.getUser({id:req.user.id}, ['friends'])
    return user.friends
  }

  @Route({
    method:Post('remove_friend'),
    description:{summary:'Removes a friend from friend list', description:'Removes a friend from friend list'},
  })
  async remove_friend(@Req() req: Request, @Body() body: RemoveFriendBody) {
    this.userService.removeFriend(req.user.id, body.user_id)
  }

  @Route({
    method:Get('block'),
    description:{summary:'Get the blocked user list', description:'Get the blocked user list'},
  })
  async get_blocked_list(@Req() req: Request) {
    const user = await this.userService.getUser({id:req.user.id}, ['blocked'])
    return user.blocked
  }

  @Route({
    method:Post('block'),
    description:{summary:'Blocks a user', description:'Blocks a user'},
  })
  async block_user(@Req() req: Request, @Body() body: BlockFriendBody) {
    if (req.user.id === body.user_id)
      throw new HttpException("Can't block yourself, sry", HttpStatus.BAD_REQUEST)
    this.userService.blockUser(req.user.id, body.user_id)
  }

}