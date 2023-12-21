import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt';

import { UserService, User } from 'src/db/user'
import { MessageService } from 'src/db/conversation/message'
import { ConversationUser, ConversationUserInfos } from 'src/db/conversation/conversation_user'

import { AccessLevel, Conversation } from '.'
import { HttpBadRequest, HttpMissingArg, HttpNotFound, HttpUnauthorized } from 'src/exceptions'

import { FindOptions, FindMultipleOptions, SelectOptions } from 'src/db/types'

import ms from 'ms'

export const CONVERSATION_USER_DEFAULT = ['conversation', 'user']

export const CONVERSATION_MESSAGES_DEFAULT = [
	'messages', 'messages.sender',
	...CONVERSATION_USER_DEFAULT.map((v) => `messages.sender.${v}`)
]

export const CONVERSATION_DEFAULT = ['owner', 'users',
	...CONVERSATION_USER_DEFAULT.map((v) => `users.${v}`)
]


function addCurrentTime(duration: string): number {
	const durationInMilliseconds = ms(duration);
	if (isNaN(durationInMilliseconds)) {
		throw new HttpBadRequest('Invalid duration string');
	}

	const currentTime = new Date().getTime();
	const result = currentTime + durationInMilliseconds;

	return result;
}

@Injectable()
export class ConversationService {
	constructor(
		@InjectRepository(Conversation)
		private conversationRepository: Repository<Conversation>,

		@InjectRepository(ConversationUser)
		private convUserRepository: Repository<ConversationUser>,

		@InjectRepository(ConversationUserInfos)
		private userInfosRepository: Repository<ConversationUserInfos>,

		@Inject(forwardRef(() => UserService))
		private userService: UserService,

		private messageService: MessageService
	) { }

	async getConversationUser(where: FindOptions<ConversationUser>, relations = [] as string[]) {
		const connection = await this.convUserRepository.findOne({ where: where, relations: relations })
		if (!connection)
			throw new HttpNotFound("Conversation user")
		return connection
	}

	async getConversationUsers(where: FindMultipleOptions<ConversationUser>, relations = [] as string[]) {
		const connection = await this.convUserRepository.find({ where: where, relations: relations })
		if (!connection)
			throw new HttpNotFound("Conversation user")
		return connection
	}

	async createConversationUser(user: User, conversation: Conversation) {
		return this.convUserRepository.save({
			user: user,
			conversation: conversation,
			messages: []
		})
	}

	async deleteConversationUser(where: FindOptions<Conversation>, clear_messages = false) {
		const conversationUser = await this.getConversationUser(where, (clear_messages ? ['messages'] : []))
		if (clear_messages)
			this.messageService.remove(conversationUser.messages)
		this.convUserRepository.remove(conversationUser)
	}

	async deleteConversationUsers(where: FindOptions<Conversation>, clear_messages = false) {
		const conversationUsers = await this.getConversationUsers(where, (clear_messages ? ['messages'] : []))
		conversationUsers.forEach((u) => {
			if (clear_messages)
				this.messageService.remove(u.messages)
			this.convUserRepository.remove(u)
		})
	}



	async getConversationUserInfos(where: FindOptions<ConversationUserInfos>, relations = [] as string[]) {
		const connection = await this.userInfosRepository.findOne({ where: where, relations: relations })
		if (!connection)
			throw new HttpNotFound("Conversation user infos")
		return connection
	}

	async getConversationUsersInfos(where: FindMultipleOptions<ConversationUserInfos>, relations = [] as string[]) {
		const connection = await this.userInfosRepository.find({ where: where, relations: relations })
		if (!connection)
			throw new HttpNotFound("Conversation user infos")
		return connection
	}

	async deleteConversationUserInfo(where: FindOptions<Conversation>) {
		const userInfo = await this.getConversationUserInfos(where)
		this.userInfosRepository.remove(userInfo)
	}

	async deleteConversationUserInfos(where: FindOptions<Conversation>) {
		const userInfos = await this.getConversationUsersInfos(where)
		userInfos.forEach((u) => {
			this.userInfosRepository.remove(u)
		})
	}


	async getConversationPassword(id: number) {
		return this.conversationRepository.createQueryBuilder('conversation')
			.where('conversation.id = :id', { id })
			.addSelect(['conversation.password'])
			.getOne();
	}

	async getConversation(where: FindOptions<Conversation>, relations = [] as string[]) {
		const connection = await this.conversationRepository.findOne({ where, relations, })
		if (!connection)
			throw new HttpNotFound("Conversation")
		return connection
	}

	async getConversations(where: FindMultipleOptions<Conversation>, relations = [] as string[]) {
		const connection = await this.conversationRepository.find({ where, relations, })
		if (!connection)
			throw new HttpNotFound("Conversation")
		return connection
	}

	async createConversation(user_id: number, title: string, access_level: AccessLevel, password?: string) {
		if (access_level === AccessLevel.PROTECTED && (password === undefined || password === "")) {
			throw new HttpMissingArg("Password is needed for a conversation with an access level of PROTECTED")
		}

		const src_password = password
		if (access_level === AccessLevel.PROTECTED) {
			const saltOrRounds = 10;
			password = await bcrypt.hash(password, saltOrRounds);
		}

		const user = await this.userService.getUser({ id: user_id })
		const new_conv_template = this.conversationRepository.create(Object.assign({}, {
			title: title,
			owner: user,
			access_level: access_level,
			users: [],
			messages: []
		}, access_level === AccessLevel.PROTECTED ? { password: password } : {}))
		const new_conv = await this.conversationRepository.save(new_conv_template)
		return this.addUserToConversation({ id: new_conv.id }, user, src_password)
	}

	async updateConversation(conv: Partial<Conversation> & { id: number }): Promise<Conversation> {

		if (conv.id === undefined)
			throw new HttpNotFound("Conversation")
		await this.getConversation({ id: conv.id })
		return this.conversationRepository.save({ id: conv.id, ...conv })
	}

	async deleteConversation(where: FindOptions<Conversation>) {
		return this.getConversation(where, ['users', 'messages'])
			.then((conversation) => {
				return Promise.all([
					this.messageService.remove(conversation.messages),
					this.convUserRepository.remove(conversation.users),
					this.conversationRepository.remove(conversation)
				])
			})
	}

	async addUserToConversation(where: FindOptions<Conversation>, user: User, password?: string) {
		const conv = await this.getConversation(where, ["users"])
		const conv_password = await this.getConversationPassword(conv.id)

		if (conv.access_level === AccessLevel.PROTECTED) {
			if (!password) {
				throw new HttpMissingArg("Password is needed for a conversation with an access level of PROTECTED")
			}
			const hash = await bcrypt.compare(password, conv_password.password);
			if (!hash) {
				throw new HttpUnauthorized("Wrong password")
			}
		}

		let conv_user = await this.getConversationUser({ user: { id: user.id }, conversation: { id: conv.id } })
			.catch((e) => { if (e instanceof HttpNotFound) return undefined; else throw e })

		if (!conv_user) {
			const conv_ref = await this.conversationRepository.findOne({ where, relations: [] })
			conv_user = await this.createConversationUser(user, conv_ref)
		}
		conv.users.push(conv_user)
		return this.conversationRepository.save(conv).then((new_conv) => this.getConversation({ id: new_conv.id }, [...CONVERSATION_DEFAULT]))
	}

	async removeUserFromConversation(where: FindOptions<Conversation>, user: ConversationUser) {
		const conv = await this.getConversation(where, [...CONVERSATION_DEFAULT])
		conv.users = conv.users.filter(u => u.id != user.id)

		if (conv.owner.id === user.id) {

			let current_date = new Date(8640000000000000)
			let next_owner: ConversationUser = undefined

			conv.users.forEach((u) => {
				if (u.isAdmin && u.becameAdminAt < current_date) {
					current_date = u.becameAdminAt
					next_owner = u
				}
			})

			current_date = new Date(8640000000000000)
			if (next_owner === undefined) {
				conv.users.forEach((u) => {
					if (u.joinedAt < current_date) {
						current_date = u.joinedAt
						next_owner = u
					}
				})
			}

			if (next_owner === undefined) {
				console.error("No next owner ???????")
			} else {
				conv.owner = next_owner.user
			}

		}

		return this.conversationRepository.save(conv).then((new_conv) => this.getConversation({ id: new_conv.id }, [...CONVERSATION_DEFAULT]))
	}

	async makeUserAdmin(user: ConversationUser) {
		user.isAdmin = true
		user.becameAdminAt = new Date()
		return this.convUserRepository.save(user)
	}

	async muteUser(user: ConversationUser, duration: string) {
		const date = new Date(addCurrentTime(duration));
		user.mutedUntil = date
		return this.convUserRepository.save(user)
	}


}
