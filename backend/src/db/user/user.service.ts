import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { User } from './user.entity';
import { FriendRequest } from './friend_request.entity';
import { User42Api } from 'src/auth/42api/user42api.interface';

export interface Oauth42Token
{
  access_token: string
  expires: string
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FriendRequest)
    private frRepository: Repository<FriendRequest>,
  ) {}

  async getUser(where: FindOptionsWhere<User> = {}, relations = [] as string[]): Promise<User> {
    const user = await this.usersRepository.findOne({where:where, relations:relations, })
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    return user;
  }

  async getUsers(where: FindOptionsWhere<User> = {}, relations = [] as string[]): Promise<User[]> {
    const user = await this.usersRepository.find({where:where, relations:relations, });
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    return user;
  }

  async createUser(user42api:User42Api): Promise<User> {
    if (await this.getUser({id:user42api.id}).catch(() => null))
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST)

    const user = this.usersRepository.create({
      id:user42api.id,
      username:user42api.username,
      image:user42api.image,
    });
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  async updateOrCreateUser(user42api:User42Api): Promise<User>
  {
    let user = await this.getUser({id:user42api.id}).catch(() => null)
    if (!user) {
      user = await this.createUser(user42api)
    }

    user.image = user42api.image
    user.username = user42api.username
    await this.usersRepository.save(user)

    return user;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async sendFriendRequest(from:User, to:User, content:string) {
    return await this.frRepository.save({
      content:content,
      sender:from,
      receiver:to
    })
  }

  async acceptFriendRequest(id:number) {
    const request = await this.frRepository.findOne({where:{id:id}, relations:['sender', 'receiver']})
    if (!request)
      throw new HttpException('Friend request not found', HttpStatus.BAD_REQUEST)

    const sender = await this.getUser({id:request.sender.id}, ['friends'])
    const receiver = await this.getUser({id:request.receiver.id}, ['friends'])

    sender.friends.push(receiver)
    receiver.friends.push(sender)
    this.usersRepository.save(sender)
    this.usersRepository.save(receiver)
    this.frRepository.remove(request)
  }

  async denyFriendRequest(id:number) {
    const request = await this.frRepository.findOne({where:{id:id}, relations:['sender', 'receiver']})
    this.frRepository.remove(request)
  }

  async removeFriend(user_id:number, friend_id:number) {
    const user = await this.getUser({id:user_id}, ['friends'])
    const friend = await this.getUser({id:friend_id}, ['friends'])
  
    user.friends.filter((v, i) => v.id !== friend_id)
    friend.friends.filter((v, i) => v.id !== user_id)
    this.usersRepository.save(user)
    this.usersRepository.save(friend)
  }

  async blockUser(user_id:number, blocked_user_id:number) {
    const user = await this.getUser({id:user_id}, ['blocked'])
    const blocked_user = await this.getUser({id:blocked_user_id})

    user.blocked.push(blocked_user)
    this.usersRepository.save(user)
  }

  async unblockUser(user_id:number, blocked_user_id:number) {
    const user = await this.getUser({id:user_id}, ['blocked'])

    user.blocked.filter((v) => v.id !== blocked_user_id)
    this.usersRepository.save(user)
  }

}
