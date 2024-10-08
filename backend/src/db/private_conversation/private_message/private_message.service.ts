import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { FindOptionsWhere, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { PrivateMessage } from '.'
import { HttpNotFound } from 'src/exceptions'
import { FindOptions, FindMultipleOptions } from 'src/db/types'

@Injectable()
export class PrivateMessageService {
	constructor(
		@InjectRepository(PrivateMessage)
		private messageRepository: Repository<PrivateMessage>,
	) { }

	async getMessage(where: FindOptions<PrivateMessage>, relations = [] as string[]): Promise<PrivateMessage> {
		const connection = await this.messageRepository.findOne({ where, relations })
		if (!connection)
			throw new HttpNotFound("Message")
		return connection
	}

	async getMessages(where: FindMultipleOptions<PrivateMessage>, relations = [] as string[]): Promise<PrivateMessage[]> {
		const connection = await this.messageRepository.find({ where, relations })
		if (!connection)
			throw new HttpNotFound("Message")
		return connection
	}

	async createMessage(message: PrivateMessage): Promise<PrivateMessage> {
		return this.messageRepository.save(message)
	}

	async remove(messages: PrivateMessage[] | PrivateMessage): Promise<void> {
		this.messageRepository.remove(messages as any)
	}
}
