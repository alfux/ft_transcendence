import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user/user.entity';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getMessage(where: any, relations = [] as string[]): Promise<Message> {
    const connection = await this.messageRepository.findOne({where, relations, });
    if (!connection)
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
    return connection;
  }

  async createMessage(message:Message): Promise<Message> {
    try {
      await this.messageRepository.save(message);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return message;
  }

  async remove(id: number): Promise<void> {
    await this.messageRepository.delete(id);
  }
}
