import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { FindOptionsWhere, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { Message } from '.'
import { HttpNotFound } from 'src/exceptions'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) { }

  async getMessage(where: FindOptionsWhere<Message>, relations = [] as string[]): Promise<Message> {
    const connection = await this.messageRepository.findOne({ where, relations })
    if (!connection)
      throw new HttpNotFound("Message")
    return connection
  }

  async getMessages(where: FindOptionsWhere<Message>, relations = [] as string[]): Promise<Message[]> {
    const connection = await this.messageRepository.find({ where, relations })
    if (!connection)
      throw new HttpNotFound("Message")
    return connection
  }

  async createMessage(message: Message): Promise<Message> {
    return this.messageRepository.save(message)
  }

  async remove(messages: Message[] | Message): Promise<void> {
    this.messageRepository.remove(messages as any)
  }
}
