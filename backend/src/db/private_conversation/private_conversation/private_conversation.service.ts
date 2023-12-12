import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere } from 'typeorm'

import { UserService } from 'src/db/user'

import { PrivateConversation } from '.'
import { HttpNotFound } from 'src/exceptions'

@Injectable()
export class PrivateConversationService {
  constructor(
    @InjectRepository(PrivateConversation)
    private conversationRepository: Repository<PrivateConversation>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) { }

  async getPrivateConversation(where: FindOptionsWhere<PrivateConversation>, relations = [] as string[]) {
    const connection = await this.conversationRepository.findOne({ where, relations, })
    if (!connection)
      throw new HttpNotFound("Private Conversation")
    return connection
  }

  async getPrivateConversations(where: FindOptionsWhere<PrivateConversation>, relations = [] as string[]) {
    const connection = await this.conversationRepository.find({ where, relations, })
    if (!connection)
      throw new HttpNotFound("Private Conversation")
    return connection
  }

  async createPrivateConversation(user1_id: number, user2_id: number) {
    const users = await Promise.all([this.userService.getUser({ id: user1_id }), this.userService.getUser({ id: user2_id })])
    return this.conversationRepository.save({
      users: users,
      messages: []
    })
  }
}
