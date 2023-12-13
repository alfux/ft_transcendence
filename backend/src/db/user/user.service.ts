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
}
