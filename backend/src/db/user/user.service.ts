import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { User } from './user.entity';
import { User42Api } from 'src/auth/42api/user42api.interface';

export interface Oauth42Token
{
  access_token: string
  expires: string
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getUser(where: FindOptionsWhere<User> = {}, relations = [] as string[]): Promise<User> {
    const user = await this.usersRepository.findOne({where:where, relations:relations, });
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
    const user = this.usersRepository.create({
      id:user42api.id,
      username:user42api.username,
      image:user42api.image
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
    let user:User = await this.getUser({id:user42api.id}).catch(() => null)
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
}
