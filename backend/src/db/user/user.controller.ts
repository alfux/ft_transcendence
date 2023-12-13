import { Req, Controller, Get, Post, Delete, Body, HttpException, HttpStatus, ValidationPipe, Inject, forwardRef } from '@nestjs/common'
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger'

import { NotificationsService } from 'src/notifications'
import { Request } from 'src/auth/interfaces/request.interface'

import { FriendRequestService, MatchService, UserService } from '.'

import { Route } from 'src/route'
import { HttpBadRequest, HttpMissingArg, HttpNotFound, HttpUnauthorized } from 'src/exceptions'

class SendFriendRequestBody {
  @ApiProperty({ description: 'User to send the request to' })
  username: string
}
class AcceptFriendRequestBody {
  @ApiProperty({ description: 'Id of the request' })
  id: number
}
class DenyFriendRequestBody {
  @ApiProperty({ description: 'Id of the request' })
  id: number
}
class RemoveFriendBody {
  @ApiProperty({ description: 'Id of the user to remove' })
  user_id: number
}

class SendPlayRequestBody {
  @ApiProperty({ description: 'User to send the request to' })
  username: string
}
class AcceptPlayRequestBody {
  @ApiProperty({ description: 'Id of the request' })
  id: number
}
class DenyPlayRequestBody {
  @ApiProperty({ description: 'Id of the request' })
  id: number
}


class BlockFriendBody {
  @ApiProperty({ description: 'Id of the user to block' })
  user_id: number
}

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {

  constructor(
    private userService: UserService,

    @Inject(forwardRef(() => MatchService))
    private matchService: MatchService,
    @Inject(forwardRef(() => FriendRequestService))
    private friendRequestService: FriendRequestService,

    private notificationService: NotificationsService
  ) { }

  @Route({
    method: Get('me'),
    description: { summary: 'Get user info', description: 'Returns authenticated user\'s info' },
    responses: [{ status: 200, description: 'Found user successfully' }]
  })
  getMe(@Req() req: Request) {
    return this.userService.getUser({ id: req.user.id })
  }

  @Route({
    method: Get('/'),
    description: { summary: 'Get all users info', description: 'Returns all users info' },
    responses: [{ status: 200, description: 'Found user successfully' }]
  })
  getAllUsers() {
    return this.userService.getUsers()
  }


  @Route({
    method: Get('friend_request'),
    description: { summary: 'Get all friend requests', description: 'Get all friend requests' },
  })
  async get_friend_request(@Req() req: Request) {
    const user = await this.userService.getUser({ id: req.user.id }, [
      'friends_requests_recv',
      'friends_requests_recv.sender',
      'friends_requests_recv.receiver',

      'friends_requests_sent',
      'friends_requests_sent.sender',
      'friends_requests_sent.receiver'
    ])
    return {
      received: user.friends_requests_recv,
      sent: user.friends_requests_sent
    }
  }

  @Route({
    method: Post('friend_request'),
    description: { summary: 'Sends a friend request', description: 'Sends a friend request' },
  })
  async send_friend_request(@Req() req: Request, @Body() body: SendFriendRequestBody) {
    if (body.username === undefined)
      throw new HttpMissingArg()

    const existing_friend_request = await this.friendRequestService.getFriendRequest({
      sender: { id:req.user.id },
      receiver: { username: body.username }
    })
    .catch((e) => {
      if (!(e instanceof HttpNotFound))
        throw e
    })

    if (existing_friend_request)
      throw new HttpBadRequest()

    const existing_recvd_friend_request = await this.friendRequestService.getFriendRequest({
      receiver: { id:req.user.id },
      sender: { username: body.username }
    })
    .catch((e) => {
      if (!(e instanceof HttpNotFound))
        throw e
    })

    if (existing_recvd_friend_request) {
      this.userService.acceptFriendRequest(existing_recvd_friend_request.id)
      return
    }

    return this.userService.sendFriendRequest(req.user.id, body.username)
  }

  @Route({
    method: Post('friend_request_accept'),
    description: { summary: 'Accepts a friend request', description: 'Accepts a friend request' },
  })
  async accept_friend_request(@Req() req: Request, @Body() body: AcceptFriendRequestBody) {
    if (body.id === undefined)
      throw new HttpMissingArg()

    try {
      await this.userService.getUser({ id: req.user.id, friends_requests_recv: { id: body.id } })
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpUnauthorized()
    }

    const fr = await this.friendRequestService.getFriendRequest({ id: body.id }, ['sender', 'receiver'])
    this.userService.acceptFriendRequest(body.id)
    this.notificationService.emit([fr.receiver, fr.sender], "friend_request_accepted", { req: fr })
  }

  @Route({
    method: Post('friend_request_deny'),
    description: { summary: 'Deny a friend request', description: 'Deny a friend request' },
  })
  async deny_friend_request(@Req() req: Request, @Body() body: DenyFriendRequestBody) {
    if (body.id === undefined)
      throw new HttpMissingArg()
    try {
      await this.userService.getUser({ id: req.user.id, friends_requests_recv: { id: body.id } })
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpUnauthorized()
    }

    const fr = await this.friendRequestService.getFriendRequest({ id: body.id }, ['sender', 'receiver'])
    this.userService.denyFriendRequest(body.id)
    this.notificationService.emit([fr.receiver, fr.sender], "friend_request_denied", { req: fr })
  }

  @Route({
    method: Get('friends'),
    description: { summary: 'Returns the friend list', description: 'Returns the friend list' }
  })
  async get_friends_list(@Req() req: Request) {
    const user = await this.userService.getUser({ id: req.user.id }, ['friends'])
    return user.friends
  }

  @Route({
    method: Post('remove_friend'),
    description: { summary: 'Removes a friend from friend list', description: 'Removes a friend from friend list' },
  })
  async remove_friend(@Req() req: Request, @Body() body: RemoveFriendBody) {
    if (body.user_id === undefined)
      throw new HttpMissingArg()
    await this.userService.removeFriend(req.user.id, body.user_id)
  }

  @Route({
    method: Get('blocked'),
    description: { summary: 'Get the blocked user list', description: 'Get the blocked user list' },
  })
  async get_blocked_list(@Req() req: Request) {
    const user = await this.userService.getUser({ id: req.user.id }, ['blocked'])
    return user.blocked
  }

  @Route({
    method: Post('blocked'),
    description: { summary: 'Blocks a user', description: 'Blocks a user' },
  })
  async block_user(@Req() req: Request, @Body() body: BlockFriendBody) {
    if (body.user_id === undefined)
      throw new HttpMissingArg()
    if (req.user.id === body.user_id)
      throw new HttpBadRequest()
    this.userService.blockUser(req.user.id, body.user_id)
    this.userService.removeFriend(req.user.id, body.user_id)
  }

  @Route({
    method: Delete('blocked'),
    description: { summary: 'Unblocks a user', description: 'Unblocks a user' },
  })
  async unblock_user(@Req() req: Request, @Body() body: BlockFriendBody) {
    if (body.user_id === undefined)
      throw new HttpMissingArg()
    if (req.user.id === body.user_id)
      throw new HttpBadRequest()
    this.userService.unblockUser(req.user.id, body.user_id)
  }



  @Route({
    method: Get('play_request'),
    description: { summary: 'Get all play requests', description: 'Get all play requests' },
  })
  async get_play_request(@Req() req: Request) {
    const user = await this.userService.getUser({ id: req.user.id }, [
      'play_requests_recv',
      'play_requests_recv.sender',
      'play_requests_recv.receiver',

      'play_requests_sent',
      'play_requests_sent.sender',
      'play_requests_sent.receiver'
    ])
    return {
      received: user.play_requests_recv,
      sent: user.play_requests_sent
    }
  }

  @Route({
    method: Post('play_request'),
    description: { summary: 'Sends a play request', description: 'Sends a play request' },
  })
  async send_play_request(@Req() req: Request, @Body() body: SendPlayRequestBody) {
    if (body.username === undefined)
      throw new HttpMissingArg()

    const from = await this.userService.getUser({ id: req.user.id })
    const to = await this.userService.getUser({ username: body.username })
    if (from.id === to.id)
      throw new HttpBadRequest()
    //TODO
    //const friend_req = await this.userService(from, to)
//
    //this.notificationService.emit([to], "play_request_recv", { req: friend_req })
//
    //return friend_req
  }

  @Route({
    method: Post('play_request_accept'),
    description: { summary: 'Accepts a friend request', description: 'Accepts a friend request' },
  })
  async accept_play_request(@Req() req: Request, @Body() body: AcceptPlayRequestBody) {
    if (body.id === undefined)
      throw new HttpMissingArg()

    try {
      await this.userService.getUser({ id: req.user.id, play_requests_recv: { id: body.id } })
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpUnauthorized()
    }

    /*
    const fr = await this.userService.getFriendRequest({id:body.id}, ['sender', 'receiver'])
    this.notificationService.emit([fr.receiver, fr.sender], "play_request_accepted", {req:fr})
    */

    this.userService.acceptPlayRequest(body.id)
    //TODO: launch game with those 2 players
  }

  @Route({
    method: Post('play_request_deny'),
    description: { summary: 'Deny a play request', description: 'Deny a play request' },
  })
  async deny_play_request(@Req() req: Request, @Body() body: DenyPlayRequestBody) {
    if (body.id === undefined)
      throw new HttpMissingArg()
    try {
      await this.userService.getUser({ id: req.user.id, play_requests_recv: { id: body.id } })
    }
    catch (e) {
      if (e instanceof HttpException)
        throw new HttpUnauthorized()
    }

    this.userService.denyPlayRequest(body.id)
  }


  @Route({
    method: Get('matches'),
    description: { summary: 'Get the match history', description: 'Get the match history' }
  })
  async get_matches(@Req() req: Request) {
    const matches = await this.matchService.getMatches({players: {id:req.user.id}}, ['players'])
    return this.matchService.getMatches(matches.map((v) => {return {id:v.id}}), ['players', 'winner'])
  }

}