import { Injectable, HttpStatus, HttpException, Inject, forwardRef } from '@nestjs/common'
import { FindOptionsWhere, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { PlayRequest } from '.'
import { HttpBadRequest, HttpNotFound } from 'src/exceptions'
import { FindOptions, FindMultipleOptions } from 'src/db/types'
import { UserService } from '../user.service'
import { NotificationsService } from 'src/notifications'
import { User } from '../user.entity'

@Injectable()
export class PlayRequestService {
  constructor(
    @InjectRepository(PlayRequest)
    private playRequestRepository: Repository<PlayRequest>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    private notificationsService: NotificationsService
  ) { }

  async getPlayRequest(where: FindOptions<PlayRequest> = {}, relations = [] as string[]): Promise<PlayRequest> {
    const playRequest = await this.playRequestRepository.findOne({ where: where, relations: relations, })
    if (!playRequest)
      throw new HttpNotFound("Play Request")
    return playRequest
  }

  async getPlayRequestes(where: FindMultipleOptions<PlayRequest> = {}, relations = [] as string[]): Promise<PlayRequest[]> {
    const playRequest = await this.playRequestRepository.find({ where: where, relations: relations, })
    if (!playRequest)
      throw new HttpNotFound("Play Request")
    return playRequest
  }

  async sendPlayRequest(from_user: FindOptions<User>, to_user: FindOptions<User>) {
    const from = await this.userService.getUser(from_user, [])
    const to = await this.userService.getUser(to_user, ['blocked'])

    if (from.id === to.id)
      throw new HttpBadRequest()
    if (to.blocked.find((v) => v.id === from.id))
      throw new HttpBadRequest()


    if (await this.getPlayRequest({
      sender: { id: from.id },
      receiver: { id: to.id }
    }).catch((e) => {
      if (!(e instanceof HttpNotFound))
        throw e
      return undefined
    })) {
      throw new HttpBadRequest()
    }

    const existing_received_request = await this.getPlayRequest({
      sender: { id: from.id },
      receiver: { id: to.id }
    }).catch((e) => { if (!(e instanceof HttpNotFound)) throw e; return undefined })
    if (existing_received_request) {
      this.acceptPlayRequest(existing_received_request.id)
      return
    }

    const new_playRequest = this.playRequestRepository.create({
      sender: from,
      receiver: to
    })
    return this.playRequestRepository.save(new_playRequest)
      .then((x) => {
        this.notificationsService.emit([to], "play_request_recv", { req: x });
        return x
      })
  }

  async acceptPlayRequest(id: number) {
    const request = await this.getPlayRequest({ id: id }, ['sender', 'receiver'])
    if (!request)
      throw new HttpNotFound("Play Request")

    this.playRequestRepository.remove(request)

    //TODO: LAUNCH GAME
  }

  async denyPlayRequest(id: number) {
    const request = await this.getPlayRequest({ id: id }, ['sender', 'receiver'])
    this.playRequestRepository.remove(request)

    this.notificationsService.emit([request.sender, request.receiver], "friend_request_denied", { req: request })
  }

}
