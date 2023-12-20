import { Req, Controller, Get, Post, Body, Inject, forwardRef } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { NotificationsService } from 'src/notifications'
import { Request } from 'src/auth/interfaces/request.interface'

import { FriendRequestService, UserService } from '.'

import { Route } from 'src/route'
import { HttpBadRequest, HttpNotFound, HttpUnauthorized } from 'src/exceptions'
import * as DTO from './user.dto'

@ApiBearerAuth()
@ApiTags('user/friend_request')
@Controller('user/friend_request')
export class UserFriendRequestController {

	constructor(
		private userService: UserService,

		@Inject(forwardRef(() => FriendRequestService))
		private friendRequestService: FriendRequestService,
	) { }

	@Route({
		method: Get('/'),
		description: { summary: 'Get all friend requests', description: 'Get all friend requests' },
	})
	async get_friend_request(@Req() req: Request) {
		const user = await this.userService.getUser({ id: req.user.id }, [
			'friends_requests_recv',
			'friends_requests_recv.sender',
			'friends_requests_recv.receiver',

			'friends_requests_sent',
			'friends_requests_sent.sender',
			'friends_requests_sent.receiver'
		])
		return {
			received: user.friends_requests_recv,
			sent: user.friends_requests_sent
		}
	}

	@Route({
		method: Post('/'),
		description: { summary: 'Sends a friend request', description: 'Sends a friend request' },
	})
	async send_friend_request(@Req() req: Request, @Body() body: DTO.SendFriendRequestBody) {

		//Check if user didn't already send one
		await this.friendRequestService.getFriendRequest({
			sender: { id: req.user.id },
			receiver: { id: body.user_id }
		})
			.then((e) => { throw new HttpBadRequest("Friend request already existing") })
			.catch((e) => { if (!(e instanceof HttpNotFound)) throw e })


		//Check if user is trying to add someone who already sent an invite
		return this.friendRequestService.getFriendRequest({
			receiver: { id: req.user.id },
			sender: { id: body.user_id }
		})
			.then((req) => { //Existing request found
				this.userService.acceptFriendRequest(req.id)
			})
			.catch(async (e) => {
				if (!(e instanceof HttpNotFound))
					throw e
				else { //No already existing request found, sending one
					const from = await this.userService.getUser({ id: req.user.id }, ['friends'])
					const to = await this.userService.getUser({ id: body.user_id }, ['blocked', 'friends'])

					return this.friendRequestService.sendFriendRequest(from, to)
				}
			})
	}

	@Route({
		method: Post('accept'),
		description: { summary: 'Accepts a friend request', description: 'Accepts a friend request' },
	})
	async accept_friend_request(@Req() req: Request, @Body() body: DTO.AcceptFriendRequestBody) {
		const friend_req = await this.friendRequestService.getFriendRequest({ id: body.id }, ['sender', 'receiver'])
		if (friend_req.receiver.id !== req.user.id) {
			throw new HttpUnauthorized()
		}

		return await this.userService.acceptFriendRequest(friend_req.id)
	}

	@Route({
		method: Post('deny'),
		description: { summary: 'Deny a friend request', description: 'Deny a friend request' },
	})
	async deny_friend_request(@Req() req: Request, @Body() body: DTO.DenyFriendRequestBody) {
		const friend_req = await this.friendRequestService.getFriendRequest({ id: body.id }, ['sender', 'receiver'])
		if (friend_req.receiver.id !== req.user.id) {
			throw new HttpUnauthorized()
		}

		this.userService.denyFriendRequest(body.id)
	}

}