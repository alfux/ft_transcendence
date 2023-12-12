import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { MatchService, User } from 'src/db/user'

import { PlayRequest, PlayRequestService } from './play_request/'
import { FriendRequest, FriendRequestService } from './friend_request'
import { NotificationsService } from 'src/notifications/'
import { HttpBadRequest, HttpNotFound } from 'src/exceptions'
import { FindOptions, FindMultipleOptions } from '../types'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    
    private friendRequestService: FriendRequestService,
    private playRequestService: PlayRequestService,

    private notificationService: NotificationsService
  ) { }

  async getUser(where: FindOptions<User> = {}, relations = [] as string[]): Promise<User> {
    const user = await this.usersRepository.findOne({ where: where, relations: relations, })
    if (!user)
      throw new HttpNotFound("User")
    return user
  }

  async getUsers(where: FindMultipleOptions<User> = {}, relations = [] as string[]): Promise<User[]> {
    const user = await this.usersRepository.find({ where: where, relations: relations, })
    if (!user)
      throw new HttpNotFound("User")
    return user
  }

  async updateUser(user: Partial<User> & { id: number }): Promise<User> {

    if (user.id === undefined)
      throw new HttpNotFound("User")
    await this.getUser({ id: user.id })
    return this.usersRepository.save({ id: user.id, ...user })
  }

  async createUser(user: Partial<User> & { id: number }): Promise<User> {
    const new_user = this.usersRepository.create(user)
    const rep = await this.usersRepository.save(new_user)
    return rep
  }

  async updateOrCreateUser(user: Partial<User> & { id: number }): Promise<User> {
    let u = await this.getUser({ id: user.id }).catch(() => null)
    if (!u) {
      return this.createUser(user)
    }
    return this.updateUser(Object.assign(u, user))
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id)
  }

  async sendFriendRequest(from_id: number, to_username:string) {
    const from = await this.getUser({ id: from_id }, ['friends'])
    const to = await this.getUser({ username: to_username }, ['blocked', 'friends'])

    if (from.id === to.id)
      throw new HttpBadRequest()
    if (to.blocked.find((v) => v.id === from.id))
      throw new HttpBadRequest()
    if (to.friends.find((v) => v.id === from.id) || from.friends.find((v) => v.id === to.id))
      throw new HttpBadRequest()

    return this.friendRequestService.createFriendRequest({
      sender: from,
      receiver: to
    })
    .then((x) => {
      this.notificationService.emit([to], "friend_request_recv", { req: x });
      return x
    })
  }

  async acceptFriendRequest(id: number) {
    const request = await this.friendRequestService.getFriendRequest({ id: id }, ['sender', 'receiver'])
    if (!request)
      throw new HttpNotFound("Friend Request")

    const sender = await this.getUser({ id: request.sender.id }, ['friends'])
    const receiver = await this.getUser({ id: request.receiver.id }, ['friends'])

    sender.friends.push(receiver)
    receiver.friends.push(sender)
    this.usersRepository.save(sender)
    this.usersRepository.save(receiver)
    this.friendRequestService.removeFriendRequest(request)

    this.notificationService.emit([sender], "friend_new", { user: { id: receiver.id, username: receiver.username, image: receiver.image } })
    this.notificationService.emit([receiver], "friend_new", { user: { id: sender.id, username: sender.username, image: sender.image } })
  }

  async denyFriendRequest(id: number) {
    const request = await this.friendRequestService.getFriendRequest({ id: id }, ['sender', 'receiver'])
    this.friendRequestService.removeFriendRequest(request)
  }

  async removeFriend(user_id: number, friend_id: number) {

    if (user_id === friend_id) {
      throw new HttpBadRequest()
    }

    const user = await this.getUser({ id: user_id }, ['friends'])
    const friend = await this.getUser({ id: friend_id }, ['friends'])

    user.friends = user.friends.filter((v) => v.id !== friend_id)
    friend.friends = friend.friends.filter((v) => v.id !== user_id)
    this.usersRepository.save(user)
    this.usersRepository.save(friend)

    this.notificationService.emit([user], "friend_delete", { user: friend })
    this.notificationService.emit([friend], "friend_delete", { user: user })
  }

  async blockUser(user_id: number, blocked_user_id: number) {
    const user = await this.getUser({ id: user_id }, ['blocked'])
    const blocked_user = await this.getUser({ id: blocked_user_id })

    user.blocked.push(blocked_user)
    this.usersRepository.save(user)

    this.notificationService.emit([user], "blocked_new", { user: blocked_user })
  }

  async unblockUser(user_id: number, blocked_user_id: number) {
    const user = await this.getUser({ id: user_id }, ['blocked'])

    const blocked = user.blocked.find((v) => v.id === blocked_user_id)
    if (!blocked)
      throw new HttpBadRequest()
    user.blocked = user.blocked.filter((v) => v.id !== blocked_user_id)
    this.usersRepository.save(user)

    this.notificationService.emit([user], "blocked_delete", { user: blocked })
  }

  async acceptPlayRequest(id: number) {
    const request = await this.playRequestService.getPlayRequest({ id: id }, ['sender', 'receiver'])
    if (!request)
      throw new HttpNotFound("Play Request")

    const sender = await this.getUser({ id: request.sender.id })
    const receiver = await this.getUser({ id: request.receiver.id })

    this.playRequestService.removePlayRequest(request)

    this.notificationService.emit([receiver], "play_request_recv", { user: { id: sender.id, username: sender.username, image: sender.image } })
  }

  async denyPlayRequest(id: number) {
    const request = await this.playRequestService.getPlayRequest({ id: id }, ['sender', 'receiver'])
    this.playRequestService.removePlayRequest(request)

    this.notificationService.emit([request.sender, request.receiver], "friend_request_denied", { req: request })
  }


}
