import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { PrivateMessage } from '.'

@Injectable()
export class PrivateMessageService {
  constructor(
    @InjectRepository(PrivateMessage)
    private messageRepository: Repository<PrivateMessage>,
  ) { }

  async getPrivateMessage(where: FindOptionsWhere<PrivateMessage>, relations = [] as string[]): Promise<PrivateMessage> {
    const connection = await this.messageRepository.findOne({ where, relations })
    if (!connection)
      throw new HttpException('Private message not found', HttpStatus.NOT_FOUND)
    return connection
  }

  async getPrivateMessages(where: FindOptionsWhere<PrivateMessage>, relations = [] as string[]): Promise<PrivateMessage[]> {
    const connection = await this.messageRepository.find({ where, relations })
    if (!connection)
      throw new HttpException('Private message not found', HttpStatus.NOT_FOUND)
    return connection
  }

  async createPrivateMessage(message: PrivateMessage): Promise<PrivateMessage> {
    try {
      const new_message = await this.messageRepository.save(message)

      return new_message
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async remove(messages: PrivateMessage[] | PrivateMessage): Promise<void> {
    this.messageRepository.remove(messages as any)
  }
}
