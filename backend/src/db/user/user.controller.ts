import { Req, Controller, Get, Post, Delete, Patch, Body, Inject, forwardRef, Param, ParseIntPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { NotificationsService } from 'src/notifications'
import { Request } from 'src/auth/interfaces/request.interface'

import { FriendRequestService, MatchService, PlayRequestService, UserService } from '.'

import { Route } from 'src/route'
import { HttpBadRequest, HttpMissingArg } from 'src/exceptions'
import * as DTO from './user.dto'

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
    @Inject(forwardRef(() => PlayRequestService))
    private playRequestService: PlayRequestService,

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
    method: Patch("me"),
    description: { summary: 'Update user infos', description: 'Update user infos' }
  })
  async update_user_infos(@Req() req: Request, @Body() body: DTO.UpdateUserInfosBody) {
    const user = await this.userService.getUser({id: req.user.id})

    user.username = body.username
    user.image = body.image
    user.email = body.email

    await this.userService.updateUser(user)
    return this.userService.getUser({id: user.id})
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
    method: Get('friends'),
    description: { summary: 'Returns the friend list', description: 'Returns the friend list' }
  })
  async get_friends_list(@Req() req: Request) {
    const user = await this.userService.getUser({ id: req.user.id }, ['friends'])
    return user.friends
  }

  @Route({
    method: Delete('friends/:id'),
    description: { summary: 'Removes a friend from friend list', description: 'Removes a friend from friend list' },
  })
  async remove_friend(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.userService.removeFriend(req.user.id, id)
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
  async block_user(@Req() req: Request, @Body() body: DTO.BlockFriendBody) {
    if (body.user_id === undefined)
      throw new HttpMissingArg()
    if (req.user.id === body.user_id)
      throw new HttpBadRequest()
    this.userService.removeFriend(req.user.id, body.user_id).catch((e) => {})
    return this.userService.blockUser(req.user.id, body.user_id)
  }

  @Route({
    method: Delete('blocked/:id'),
    description: { summary: 'Unblocks a user', description: 'Unblocks a user' },
  })
  async unblock_user(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    if (req.user.id === id)
      throw new HttpBadRequest()
    return this.userService.unblockUser(req.user.id, id)
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