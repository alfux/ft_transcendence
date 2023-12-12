import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { FindOptionsWhere, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { PlayRequest } from '.'
import { HttpNotFound } from 'src/exceptions'

@Injectable()
export class PlayRequestService {
  constructor(
    @InjectRepository(PlayRequest)
    private playRequestRepository: Repository<PlayRequest>,
  ) { }

  async getPlayRequest(where: FindOptionsWhere<PlayRequest> = {}, relations = [] as string[]): Promise<PlayRequest> {
    const playRequest = await this.playRequestRepository.findOne({ where: where, relations: relations, })
    if (!playRequest)
      throw new HttpNotFound("Play Request")
    return playRequest
  }

  async getPlayRequestes(where: FindOptionsWhere<PlayRequest> = {}, relations = [] as string[]): Promise<PlayRequest[]> {
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

}
