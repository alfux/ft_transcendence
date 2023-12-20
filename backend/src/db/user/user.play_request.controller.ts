import { Req, Controller, Get, Post, Body, Inject, forwardRef } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { NotificationsService } from 'src/notifications'
import { Request } from 'src/auth/interfaces/request.interface'

import { PlayRequestService, UserService } from '.'

import { Route } from 'src/route'
import { HttpBadRequest, HttpNotFound, HttpUnauthorized } from 'src/exceptions'
import * as DTO from './user.dto'

@ApiBearerAuth()
@ApiTags('user/play_request')
@Controller('user/play_request')
export class UserPlayRequestController {

  constructor(
    private userService: UserService,

    @Inject(forwardRef(() => PlayRequestService))
    private playRequestService: PlayRequestService,
  ) { }

  @Route({
    method: Get('/'),
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
    method: Post('/'),
    description: { summary: 'Sends a play request', description: 'Sends a play request' },
  })
  async send_play_request(@Req() req: Request, @Body() body: DTO.SendPlayRequestBody) {

    //Check if user didn't already send one
    await this.playRequestService.getPlayRequest({
      sender: { id: req.user.id },
      receiver: { id: body.user_id }
    })
      .then((e) => { throw new HttpBadRequest("Play request already exists") })
      .catch((e) => { if (!(e instanceof HttpNotFound)) throw e })


    //Check if user is trying to add someone who already sent an invite
    return this.playRequestService.getPlayRequest({
      receiver: { id: req.user.id },
      sender: { id: body.user_id }
    })
      .then((req) => { //Existing request found
        this.userService.acceptPlayRequest(req.id)
      })
      .catch(async (e) => {
        if (!(e instanceof HttpNotFound))
          throw e
        else { //No already existing request found, sending one
          const from = await this.userService.getUser({ id: req.user.id }, ['friends'])
          const to = await this.userService.getUser({ id: body.user_id }, ['blocked', 'friends'])

          return this.playRequestService.sendPlayRequest(from, to)
        }
      })
  }

  @Route({
    method: Post('accept'),
    description: { summary: 'Accepts a play request', description: 'Accepts a play request' },
  })
  async accept_play_request(@Req() req: Request, @Body() body: DTO.AcceptPlayRequestBody) {
    const play_req = await this.playRequestService.getPlayRequest({ id: body.id }, ['sender', 'receiver'])
    if (play_req.receiver.id !== req.user.id) {
      throw new HttpUnauthorized()
    }

    return this.userService.acceptPlayRequest(play_req.id)
  }

  @Route({
    method: Post('deny'),
    description: { summary: 'Deny a play request', description: 'Deny a play request' },
  })
  async deny_play_request(@Req() req: Request, @Body() body: DTO.DenyPlayRequestBody) {
    const play_req = await this.playRequestService.getPlayRequest({ id: body.id }, ['sender', 'receiver'])
    if (play_req.receiver.id !== req.user.id) {
      throw new HttpUnauthorized()
    }

    return this.userService.denyPlayRequest(play_req.id)
  }

}