import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { Conversation } from './conversation.entity';
import { UserService, User } from '../user';

export type OptionalType<T> = {
  [K in keyof T]?: T[K];
};

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    private userService: UserService
  ) {}

  async getConversation(where: OptionalType<Conversation>, relations = [] as string[]): Promise<Conversation> {
    const connection = await this.conversationRepository.findOne({where, relations, });
    if (!connection)
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    return connection;
  }

  async getConversations(where: OptionalType<Conversation>, relations = [] as string[]): Promise<Conversation[]> {
    const connection = await this.conversationRepository.find({where, relations, });
    if (!connection)
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);

    return connection;
  }

  async createConversation(userId:number, title:string): Promise<Conversation> {
    const user = await this.userService.getUser({id:userId})

    if (await this.conversationRepository.findOne({where:{title:title}}))
      throw new HttpException("Conversation already exists", HttpStatus.BAD_REQUEST)

    try {
      const conv = await this.conversationRepository.save({
        owner:user,
        users:[user],
        title:title
      })
      return conv
    } catch (error) {
      console.error(error)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addUserToConversation(conversation_title:string, user:User) {
    this.conversationRepository.findOne({where:{title:conversation_title}, relations:["users"]}).then((conv) => {
      conv.users.push(user)
      this.conversationRepository.save(conv)
    })
  }

  async deleteConversationById(id: number): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: {id:id},
      relations: ['messages'],
    });

    if (conversation) {
      await this.conversationRepository.remove(conversation);
    }
  }
}
