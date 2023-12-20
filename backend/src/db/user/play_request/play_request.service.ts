import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { PlayRequest } from '.'
import { HttpBadRequest, HttpNotFound } from 'src/exceptions'
import { FindOptions, FindMultipleOptions } from 'src/db/types'
import { User } from '../user.entity'
import { NotificationsService } from 'src/notifications'

@Injectable()
export class PlayRequestService {
  constructor(
    @InjectRepository(PlayRequest)
    private playRequestRepository: Repository<PlayRequest>,

    private notificationService: NotificationsService
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

  async createPlayRequest(playRequest: Omit<PlayRequest, 'id'>): Promise<PlayRequest> {
    const new_playRequest = this.playRequestRepository.create(playRequest)
    const rep = await this.playRequestRepository.save(new_playRequest)
    return rep
  }

  async removePlayRequest(request: PlayRequest) {
    this.playRequestRepository.remove(request)
  }

  async sendPlayRequest(from: User, to: User) {
    if (from.id === to.id)
      throw new HttpBadRequest("You can't send request to yourself")
    if (to.blocked.find((v) => v.id === from.id))
      throw new HttpBadRequest("You are blocked")

    return this.createPlayRequest({
      sender: from,
      receiver: to
    })
      .then((x) => {
        this.notificationService.emit([to], "friend_request_recv", { req: x });
        return x
      })
  }

}
