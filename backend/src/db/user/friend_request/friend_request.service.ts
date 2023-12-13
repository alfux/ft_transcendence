import { Injectable, HttpStatus, HttpException, forwardRef, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { FriendRequest } from '.'
import { HttpBadRequest, HttpNotFound } from 'src/exceptions'
import { FindOptions, FindMultipleOptions } from 'src/db/types'
import { UserService } from '../user.service'
import { NotificationsService } from 'src/notifications'
import { User } from '../user.entity'

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    private notificationsService: NotificationsService

  ) { }

  async getFriendRequest(where: FindOptions<FriendRequest> = {}, relations = [] as string[]): Promise<FriendRequest> {
    const friendRequest = await this.friendRequestRepository.findOne({ where: where, relations: relations, })
    if (!friendRequest)
      throw new HttpNotFound("Friend Request")
    return friendRequest
  }

  async getFriendRequestes(where: FindMultipleOptions<FriendRequest> = {}, relations = [] as string[]): Promise<FriendRequest[]> {
    const friendRequest = await this.friendRequestRepository.find({ where: where, relations: relations, })
    if (!friendRequest)
      throw new HttpNotFound("Friend Request")
    return friendRequest
  }


  async sendFriendRequest(from_user: FindOptions<User>, to_user: FindOptions<User>) {
    const from = await this.userService.getUser(from_user, ['friends'])
    const to = await this.userService.getUser(to_user, ['blocked', 'friends'])

    if (from.id === to.id)
      throw new HttpBadRequest()
    if (to.blocked.find((v) => v.id === from.id))
      throw new HttpBadRequest()
    if (to.friends.find((v) => v.id === from.id) || from.friends.find((v) => v.id === to.id))
      throw new HttpBadRequest()

    if (await this.getFriendRequest({
      sender: { id: from.id },
      receiver: { id: to.id }
    }).catch((e) => {
      if (!(e instanceof HttpNotFound))
        throw e
      return undefined
    })) {
      throw new HttpBadRequest()
    }

    const existing_received_request = await this.getFriendRequest({
      sender: { id: from.id },
      receiver: { id: to.id }
    }).catch((e) => { if (!(e instanceof HttpNotFound)) throw e; return undefined })
    if (existing_received_request) {
      this.acceptFriendRequest(existing_received_request.id)
      return
    }


    const new_friendRequest = this.friendRequestRepository.create({
      sender: from,
      receiver: to
    })
    return this.friendRequestRepository.save(new_friendRequest)
      .then((x) => {
        this.notificationsService.emit([to], "friend_request_recv", { req: x });
        return x
      })
  }

  async acceptFriendRequest(id: number) {
    const request = await this.getFriendRequest({ id: id }, ['sender', 'receiver'])
    if (!request)
      throw new HttpNotFound("Friend Request")

    const sender = await this.userService.getUser({ id: request.sender.id }, ['friends'])
    const receiver = await this.userService.getUser({ id: request.receiver.id }, ['friends'])

    sender.friends.push(receiver)
    receiver.friends.push(sender)
    this.userService.updateUser(sender)
    this.userService.updateUser(receiver)
    this.friendRequestRepository.remove(request)

    this.notificationsService.emit([sender], "friend_new", { user: { id: receiver.id, username: receiver.username, image: receiver.image } })
    this.notificationsService.emit([receiver], "friend_new", { user: { id: sender.id, username: sender.username, image: sender.image } })
  }

  async denyFriendRequest(id: number) {
    const request = await this.getFriendRequest({ id: id }, ['sender', 'receiver'])
    this.friendRequestRepository.remove(request)
  }

}
