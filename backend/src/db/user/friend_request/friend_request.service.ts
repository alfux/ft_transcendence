import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { FriendRequest } from '.'
import { HttpBadRequest, HttpNotFound } from 'src/exceptions'
import { FindOptions, FindMultipleOptions } from 'src/db/types'
import { User } from '../user.entity'
import { NotificationsService } from 'src/notifications'

@Injectable()
export class FriendRequestService {
	constructor(
		@InjectRepository(FriendRequest)
		private friendRequestRepository: Repository<FriendRequest>,

		private notificationService: NotificationsService
	) { }

	async getFriendRequest(where: FindOptions<FriendRequest> = {}, relations = [] as string[]): Promise<FriendRequest> {
		const friendRequest = await this.friendRequestRepository.findOne({ where: where, relations: relations, })
		if (!friendRequest)
			throw new HttpNotFound("Friend Request")
		return friendRequest
	}

	async getFriendRequestes(where: FindMultipleOptions<FriendRequest> = {}, relations = [] as string[]): Promise<FriendRequest[]> {
		const friendRequest = await this.friendRequestRepository.find({ where: where, relations: relations, })
		if (!friendRequest)
			throw new HttpNotFound("Friend Request")
		return friendRequest
	}

	async createFriendRequest(friendRequest: Omit<FriendRequest, 'id'>): Promise<FriendRequest> {
		const new_friendRequest = this.friendRequestRepository.create(friendRequest)
		const rep = await this.friendRequestRepository.save(new_friendRequest)
		return rep
	}

	async removeFriendRequest(request: FriendRequest) {
		this.friendRequestRepository.remove(request)
	}

	async sendFriendRequest(from: User, to: User) {
		if (from.id === to.id)
			throw new HttpBadRequest("Can't send request to yourself")
		if (to.blocked.find((v) => v.id === from.id))
			throw new HttpBadRequest("You are blocked")
		if (to.friends.find((v) => v.id === from.id) || from.friends.find((v) => v.id === to.id))
			throw new HttpBadRequest("You already have this user as friend")

		return this.createFriendRequest({
			sender: from,
			receiver: to
		})
			.then((x) => {
				this.notificationService.emit([to], "friend_request_recv", { req: x });
				return x
			})
	}

}
