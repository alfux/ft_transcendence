import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import * as bcrypt from 'bcrypt';

import { UserService, User } from 'src/db/user'

import { PrivateConversation } from '.'
import { HttpBadRequest, HttpNotFound } from 'src/exceptions'

import { FindOptions, FindMultipleOptions } from 'src/db/types'
import { PrivateMessageService } from '../private_message';

export const PRIVATE_CONVERSATION_DEFAULT = ['users']

@Injectable()
export class PrivateConversationService {
	constructor(
		@InjectRepository(PrivateConversation)
		private privateConversationRepository: Repository<PrivateConversation>,

		@Inject(forwardRef(() => UserService))
		private userService: UserService,

		private privateMessageService: PrivateMessageService,
	) { }

	async getPrivateConversation(where: FindOptions<PrivateConversation>, relations = [] as string[]) {
		const connection = await this.privateConversationRepository.findOne({ where, relations, })
		if (!connection)
			throw new HttpNotFound("Private conversation")
		return connection
	}

	async getPrivateConversations(where: FindMultipleOptions<PrivateConversation>, relations = [] as string[]) {
		console.log(where)
		const connection = await this.privateConversationRepository.find({ where, relations, })
		if (!connection)
			throw new HttpNotFound("Private conversation")
		return connection
	}

	async getPrivateConversationByUserId(user_id1: number) {
		return this.privateConversationRepository.createQueryBuilder('conversation')
			.innerJoinAndSelect('conversation.users', 'user')
			//.where('user.id = :id', { id: user_id1 })
			.getMany()
			.then((v) => {
				console.log(v);
				return v
			})
	}

	async createPrivateConversation(user_id1: number, user_id2: number) {

		const user1 = await this.userService.getUser({ id: user_id1 })
		const user2 = await this.userService.getUser({ id: user_id2 })

		const existing_conv = await this.getPrivateConversationByUserId(user_id1)
		.then((convs) =>
			Promise.all(convs.map((c) => this.getPrivateConversation({id:c.id}, ['users', 'messages', 'messages.sender'])))
		)
		.then((convs) => convs.find((c) => c.users.find((u) => u.id === user_id2)))

		if (!existing_conv)
			throw new HttpBadRequest()

		return this.privateConversationRepository.save({
			messages: [],
			users: [user1, user2],
		})
	}

	async updateConversation(conv: Partial<PrivateConversation> & { id: number }): Promise<PrivateConversation> {
		if (conv.id === undefined)
			throw new HttpNotFound("PrivateConversation")
		await this.getPrivateConversation({ id: conv.id })
		return this.privateConversationRepository.save({ id: conv.id, ...conv })
	}

	async deleteConversation(where: FindOptions<PrivateConversation>) {
		return this.getPrivateConversation(where, ['messages'])
			.then((conversation) => {
				return Promise.all([
					this.privateMessageService.remove(conversation.messages),
					this.privateConversationRepository.remove(conversation)
				])
			})
	}
}
