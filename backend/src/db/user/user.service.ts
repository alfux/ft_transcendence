import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { LoggedStatus, User } from 'src/db/user'

import { PlayRequestService } from './play_request/'
import { FriendRequestService } from './friend_request'
import { NotificationsService } from 'src/notifications/'
import { HttpBadRequest, HttpNotFound } from 'src/exceptions'
import { FindOptions, FindMultipleOptions } from '../types'
import { GameService } from 'src/game/game.service'
import { ConversationService } from '../conversation'
import { PrivateConversationService } from '../private_conversation'

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,

		private friendRequestService: FriendRequestService,

		private playRequestService: PlayRequestService,

		@Inject(forwardRef(() => GameService))
		private gameService: GameService,
		
		private notificationService: NotificationsService,
		
		@Inject(forwardRef(() => ConversationService))
		private conversationService: ConversationService,

		@Inject(forwardRef(() => PrivateConversationService))
		private privateConversationService: PrivateConversationService
	) { }

	async getUser(where: FindOptions<User> = {}, relations = [] as string[]): Promise<User> {
		const user = await this.usersRepository.findOne({ where: where, relations: relations, })
		if (!user)
			throw new HttpNotFound("User")
		return user
	}

	async getUsers(where: FindMultipleOptions<User> = {}, relations = [] as string[]): Promise<User[]> {
		const user = await this.usersRepository.find({ where: where, relations: relations, })
		if (!user)
			throw new HttpNotFound("User")
		return user
	}


	async getUserAuthSecret(id: number) {
		console.log(id)
		const user = await this.usersRepository.findOne({where: {id:id}, select: [
			'twoFactorAuthSecret',
			'twoFactorAuth',
			'username',
			'id'
		] })
		return user;
	}

	async updateUser(user: Partial<User> & { id: number }): Promise<User> {

		if (user.id === undefined)
			throw new HttpNotFound("User")
		const curr_user = await this.getUser({ id: user.id })
		return this.usersRepository.save({ id: user.id, ...Object.assign(curr_user, user) })
	}

	async updateUserStatus(user: Partial<User> & { id: number }, status: LoggedStatus) {
		if (user === undefined)
			return

		const u = await this.getUser({id: user.id}, ['friends'])
		
		u.isAuthenticated = status
		
		return this.updateUser(u)
		.then(() => {
			this.notificationService.emit([u, ...u.friends], "status_change", {
				user: u
			})
		})
	}

	async createUser(user: Partial<User> & { id: number }): Promise<User> {
		const new_user = this.usersRepository.create(user)
		const rep = await this.usersRepository.save(new_user)
		this.notificationService.emit_everyone("user_create", { user: rep })
		return rep
	}

	async updateOrCreateUser(user: Partial<User> & { id: number }): Promise<User> {
		let u = await this.getUser({ id: user.id }).catch(() => null)
		if (!u) {
			return this.createUser(user)
		}
		return this.updateUser(Object.assign(u, user))
	}

	async remove(id: number): Promise<void> {
		await this.usersRepository.delete(id)
	}


	async removeFriend(user_id: number, friend_id: number) {

		if (user_id === friend_id) {
			throw new HttpBadRequest("Can't remove yourself")
		}

		const user = await this.getUser({ id: user_id }, ['friends'])
		const friend = await this.getUser({ id: friend_id }, ['friends'])

		if (user.friends.find((u) => u.id === friend_id) === undefined &&
			friend.friends.find((u) => u.id === user_id) === undefined)
			throw new HttpNotFound("Friend")

		user.friends = user.friends.filter((v) => v.id !== friend_id)
		friend.friends = friend.friends.filter((v) => v.id !== user_id)
		this.usersRepository.save(user)
		this.usersRepository.save(friend)

		this.notificationService.emit([user], "friend_delete", { user: friend })
		this.notificationService.emit([friend], "friend_delete", { user: user })
	}

	async blockUser(user_id: number, blocked_user_id: number) {
		const user = await this.getUser({ id: user_id }, ['blocked'])
		const blocked_user = await this.getUser({ id: blocked_user_id })

		if (user.blocked.find((u) => u.id === blocked_user.id)) {
			throw new HttpBadRequest("User is blocked already")
		}

		user.blocked.push(blocked_user)
		this.usersRepository.save(user)

		this.notificationService.emit([user], "blocked_new", { user: blocked_user })
	}

	async unblockUser(user_id: number, blocked_user_id: number) {
		const user = await this.getUser({ id: user_id }, ['blocked'])

		const blocked = user.blocked.find((v) => v.id === blocked_user_id)
		if (!blocked)
			throw new HttpNotFound("Blocked user")
		user.blocked = user.blocked.filter((v) => v.id !== blocked_user_id)
		this.usersRepository.save(user)

		this.notificationService.emit([user], "blocked_delete", { user: blocked })
	}


	async acceptFriendRequest(id: number) {
		const request = await this.friendRequestService.getFriendRequest({ id: id }, ['sender', 'receiver'])
		if (!request)
			throw new HttpNotFound("Friend Request")

		const sender = await this.getUser({ id: request.sender.id }, ['friends'])
		const receiver = await this.getUser({ id: request.receiver.id }, ['friends'])

		sender.friends.push(receiver)
		receiver.friends.push(sender)
		await this.usersRepository.save(sender)
		await this.usersRepository.save(receiver)
		await this.friendRequestService.removeFriendRequest(request)

		await this.privateConversationService.createPrivateConversation(sender.id, receiver.id)
		.catch((e) => {
			if (e instanceof HttpBadRequest) { console.log(e) } else throw e
		})

		this.notificationService.emit([sender, receiver], "friend_request_accepted", { req: request })
		this.notificationService.emit([sender], "friend_new", { user: { id: receiver.id, username: receiver.username, image: receiver.image } })
		this.notificationService.emit([receiver], "friend_new", { user: { id: sender.id, username: sender.username, image: sender.image } })
	}

	async denyFriendRequest(id: number) {
		const request = await this.friendRequestService.getFriendRequest({ id: id }, ['sender', 'receiver'])
		this.friendRequestService.removeFriendRequest(request)
		this.notificationService.emit([request.receiver, request.sender], "friend_request_denied", { req: request })
	}

	async acceptPlayRequest(id: number) {
		const request = await this.playRequestService.getPlayRequest({ id: id }, ['sender', 'receiver'])

		this.playRequestService.removePlayRequest(request)

		this.gameService.startGameWith(request.receiver, request.sender)

		this.notificationService.emit([request.receiver, request.sender], "play_request_accepted", { req: request })
	}

	async denyPlayRequest(id: number) {
		const request = await this.playRequestService.getPlayRequest({ id: id }, ['sender', 'receiver'])

		this.playRequestService.removePlayRequest(request)
		this.notificationService.emit([request.sender, request.receiver], "friend_request_denied", { req: request })
	}


}
