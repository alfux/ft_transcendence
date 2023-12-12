import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { FriendRequest } from '.'
import { HttpNotFound } from 'src/exceptions'

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
  ) { }

  async getFriendRequest(where: FindOptionsWhere<FriendRequest> = {}, relations = [] as string[]): Promise<FriendRequest> {
    const friendRequest = await this.friendRequestRepository.findOne({ where: where, relations: relations, })
    if (!friendRequest)
      throw new HttpNotFound("Friend Request")
    return friendRequest
  }

  async getFriendRequestes(where: FindOptionsWhere<FriendRequest> = {}, relations = [] as string[]): Promise<FriendRequest[]> {
    const friendRequest = await this.friendRequestRepository.find({ where: where, relations: relations, })
    if (!friendRequest)
      throw new HttpNotFound("Friend Request")
    return friendRequest
  }

  async createFriendRequest(friendRequest: Omit<FriendRequest, 'id'>): Promise<FriendRequest> {
    const new_friendRequest = this.friendRequestRepository.create(friendRequest)
    const rep = await this.friendRequestRepository.save(new_friendRequest)
    return rep
  }

}
