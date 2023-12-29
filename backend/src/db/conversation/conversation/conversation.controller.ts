import { Body, Controller, Get, Post, Delete, Req, Param, HttpException, Inject, forwardRef, ParseIntPipe, Patch } from '@nestjs/common'

import { ApiBearerAuth, ApiTags, ApiProperty } from '@nestjs/swagger'

import { Request } from 'src/auth/interfaces/'
import { UserService } from 'src/db/user'
import { CONVERSATION_DEFAULT, CONVERSATION_MESSAGES_DEFAULT, CONVERSATION_USER_DEFAULT, ConversationService } from './conversation.service'
import { NotificationsService } from 'src/notifications/'
import { HttpBadRequest, HttpMissingArg, HttpUnauthorized } from 'src/exceptions'

import { Route } from 'src/route'
import { AccessLevel } from './conversation_access_level.enum'
import * as DTO from './conversation.dto'

@ApiBearerAuth()
@ApiTags('conversation')
@Controller('conversation')
export class ConversationController {

	constructor(
		private conversationService: ConversationService,
		@Inject(forwardRef(() => UserService))
		private userService: UserService,
		@Inject(forwardRef(() => NotificationsService))
		private notificationService: NotificationsService
	) { }

	@Route({
		method: Get('me'),
		description: { summary: 'Get users\'s conversations', description: 'Return a list of all the conversations the authenticated user is in' },
		responses: [{ status: 200, description: 'List of conversations retrieved successfully' }]
	})
	async getMeConversations(@Req() req: Request) {
		return this.conversationService.getConversation({ users: { user: { id: req.user.id } } }, [...CONVERSATION_DEFAULT])
	}

	@Route({
		method: Get('own'),
		description: { summary: 'Get users\'s owned conversations', description: 'Return a list of all the conversations the authenticated user owns' },
		responses: [{ status: 200, description: 'List of conversations retrieved successfully' }]
	})
	getOwnConversations(@Req() req: Request) {
		return this.conversationService.getConversations({ owner: { id: req.user.id } }, [...CONVERSATION_DEFAULT])
	}

	@Route({
		method: Get('/'),
		description: { summary: 'Get all public conversations', description: 'Return a list of all the conversations that are marked as public' },
		responses: [{ status: 200, description: 'List of conversations retrieved successfully' }]
	})
	async getAllConversations(@Req() req: Request) {

		const user = await this.userService.getUser({ id: req.user.id }, ['friends'])

		return this.conversationService.getConversations({}, [...CONVERSATION_DEFAULT])
			.then((convs) => {
				return convs.filter((c) => {
					if (c.access_level === AccessLevel.PRIVATE &&
						c.owner.id !== user.id &&
						user.friends.find((f) => f.id === c.owner.id) === undefined
					)
						return false
					return true
				})
			})
	}

	@Route({
		method: Post('/'),
		description: { summary: 'Create a conversation', description: 'Create a conversation. Owner will automatically be the creator' },
		responses: [{ status: 200, description: 'Conversation created successfully' }]
	})
	async createConversation(@Req() req: Request, @Body() body: DTO.ConversationCreateParams) {
		if (body.access_level === AccessLevel.PROTECTED) {
			if (body.password === undefined || body.password.length < 4) {
				throw new HttpBadRequest("Missing password or password too short")
			}
		}

		return this.conversationService.createConversation(req.user.id, body.title, body.access_level, body.password)
			.then((new_conv) => {
				this.notificationService.emit_everyone("conv_create", { conversation: new_conv })
				return new_conv
			})
	}

	@Route({
		method: Patch(':id'),
		description: { summary: 'Updates a conversation', description: 'Update a conversation. Updatable fields are' },
		responses: [{ status: 200, description: 'Conversation created successfully' }]
	})
	async updateConversation(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Body() body: DTO.ConversationUpdateParams) {
		const conversation = await this.conversationService.getConversation({ id: id }, [...CONVERSATION_DEFAULT])
		if (conversation.owner.id !== req.user.id) {
			throw new HttpUnauthorized("You are not the owner")
		}


		if (conversation.access_level !== AccessLevel.PRIVATE && body.access_level) {
			if (body.access_level === AccessLevel.PROTECTED) {
				if (body.password === undefined || body.password === '')
					throw new HttpBadRequest("Missing password")

				conversation.access_level = body.access_level
				conversation.password = await this.conversationService.hashPassword(body.password)
			} else {
				conversation.access_level = body.access_level
			}
		}

		if (body.title) {
			conversation.title = body.title
		}

		//if (body.access_level)
		return this.conversationService.updateConversation(conversation)
			.then((new_conv) => {
				this.notificationService.emit_everyone("conv_update", { conversation: new_conv })
				return new_conv
			})
	}

	@Route({
		method: Get(':id'),
		description: { summary: 'Get conversation content', description: 'Returns the conversation\'s messages' },
		responses: [{ status: 200, description: 'Conversation\'s content retrieved successfully' }]
	})
	async getConversation(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
		const user = await this.userService.getUser({ id: req.user.id }, ['blocked'])

		return this.conversationService.getConversation({ id: id }, [...CONVERSATION_DEFAULT, ...CONVERSATION_MESSAGES_DEFAULT])
			.then((v) => {
				if (v.users.find((x) => x.user.id === req.user.id) === undefined)
					throw new HttpUnauthorized('You are not in the conversation')

				v.messages = v.messages.filter((m) => {
					if (user.blocked.find((bl) => bl.id === m.sender.user.id)) {
						return false
					} else
						return true
				})

				v.messages.sort((a, b) => { return b.createdAt.getTime() - a.createdAt.getTime() })

				return v
			})
	}

	@Route({
		method: Delete(':id'),
		description: { summary: 'Delete a conversation', description: 'Deletes a conversation' },
		responses: [{ status: 200, description: 'Conversation deleted successfully' }]
	})
	async deleteConversation(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
		const conversation = await this.conversationService.getConversation({ id: id }, [...CONVERSATION_DEFAULT])
		if (req.user.id !== conversation.owner.id)
			throw new HttpUnauthorized("You are not the owner")

		return this.conversationService.deleteConversation({ id: id })
			.then(() => this.notificationService.emit_everyone("conv_delete", { conversation: conversation }))
	}

	@Route({
		method: Post('join'),
		description: { summary: 'Join a conversation', description: 'Makes the authenticated user join the conversation' },
		responses: [{ status: 200, description: 'Conversation joined successfully' }]
	})
	async joinConversation(@Req() req: Request, @Body() body: DTO.ConversationJoinParams) {
		const user = await this.userService.getUser({ id: req.user.id }, ['friends'])

		const conv = await this.conversationService.getConversation({ id: body.id }, [...CONVERSATION_DEFAULT])
		if (conv.access_level === AccessLevel.PRIVATE && conv.owner.id !== user.id) {

			if (user.friends.find((u) => u.id === conv.owner.id) === undefined) {
				throw new HttpUnauthorized("no")
			}

		}

		if (conv.banned.find((u) => u.id === user.id)) {
			throw new HttpUnauthorized("no")
		}

		return this.conversationService.addUserToConversation({ id: body.id }, user, body.password)
			.then((conv) => {
				this.notificationService.emit(
					conv.users.map((u) => u.user),
					"conv_join", { conversation: conv, user: user })
			})
	}

	@Route({
		method: Post('leave'),
		description: { summary: 'Leaves a conversation', description: 'Makes the authenticated user leave the conversation' },
		responses: [{ status: 200, description: 'Conversation left successfully' }]
	})
	async leaveConversation(@Req() req: Request, @Body() body: DTO.ConversationLeaveParams) {
		const conversation = await this.conversationService.getConversation({ id: body.id }, [...CONVERSATION_DEFAULT])

		const conv_user = conversation.users.find((u) => u.user.id === req.user.id)
		if (conv_user === undefined) {
			throw new HttpBadRequest('Cannot leave: not in conversation')
		}

		return this.conversationService.removeUserFromConversation({ id: body.id }, conv_user)
	}


	@Route({
		method: Post('promote'),
		description: { summary: 'Promotes a user to admin', description: 'Promotes a user to admin. Only the owner is allowed to perform this action' },
		responses: [{ status: 200, description: 'Conversation joined successfully' }]
	})
	async promote(@Req() req: Request, @Body() body: DTO.PromoteParams) {

		const conv_user = await this.conversationService.getConversationUser({ id: body.conversation_user_id }, [...CONVERSATION_USER_DEFAULT])
		const conversation = await this.conversationService.getConversation({ id: conv_user.conversation.id }, [...CONVERSATION_DEFAULT])

		if (conversation.owner.id !== req.user.id)
			throw new HttpUnauthorized("Only the owner can make other admins")

		return this.conversationService.makeUserAdmin(conv_user)
			.then(async (new_conv_user) => {

				const new_conv = await this.conversationService.getConversation({ id: new_conv_user.conversation.id }, [...CONVERSATION_DEFAULT])
				this.notificationService.emit(
					new_conv.users.map((u) => u.user),
					"conv_promote", { conversation: new_conv, user: conv_user.user }
				)
			})
	}

	@Route({
		method: Post('demote'),
		description: { summary: 'Demotes an admin', description: 'Demotes an admin. Only the owner is allowed to perform this action' },
		responses: [{ status: 200, description: 'Conversation joined successfully' }]
	})
	async demote(@Req() req: Request, @Body() body: DTO.PromoteParams) {

		const conv_user = await this.conversationService.getConversationUser({ id: body.conversation_user_id }, [...CONVERSATION_USER_DEFAULT])
		const conversation = await this.conversationService.getConversation({ id: conv_user.conversation.id }, [...CONVERSATION_DEFAULT])

		if (conversation.owner.id !== req.user.id)
			throw new HttpUnauthorized("Only the owner can make other admins")

		return this.conversationService.demoteAdmin(conv_user)
			.then(async (new_conv_user) => {

				const new_conv = await this.conversationService.getConversation({ id: new_conv_user.conversation.id }, [...CONVERSATION_DEFAULT])
				this.notificationService.emit(
					new_conv.users.map((u) => u.user),
					"conv_demote", { conversation: new_conv, user: conv_user.user }
				)
			})
	}

	@Route({
		method: Post('kick'),
		description: { summary: 'Kicks an user from the conversation', description: 'Kicks an user from the conversation. Only the owner or an admin is allowed to perform this action' }
	})
	async kick(@Req() req: Request, @Body() body: DTO.KickParams) {

		const target = await this.conversationService.getConversationUser({ id: body.conversation_user_id }, [...CONVERSATION_USER_DEFAULT])
		const conversation = await this.conversationService.getConversation({ id: target.conversation.id }, [...CONVERSATION_DEFAULT])

		const sender = await this.userService.getUser({ id: req.user.id })

		if (
			(sender.id === conversation.owner.id) ||
			(conversation.users.find((u) => { u.user.id === sender.id })?.isAdmin)
		) {

			return this.conversationService.removeUserFromConversation({ id: conversation.id }, target)
				.then(() => {
					this.notificationService.emit(
						conversation.users.map((u) => u.user),
						"conv_kick",
						{
							conversation: conversation,
							user: target.user,
							issuer: sender
						})
				})
		} else {
			throw new HttpUnauthorized("You are not owner nor an admin")
		}
	}

	@Route({
		method: Post('mute'),
		description: { summary: 'Mutes an user in a conversation', description: 'Mutes an user in a conversation. Only the owner or an admin is allowed to perform this action' }
	})
	async mute(@Req() req: Request, @Body() body: DTO.MuteParams) {

		const target = await this.conversationService.getConversationUser({ id: body.conversation_user_id }, [...CONVERSATION_USER_DEFAULT])
		const conversation = await this.conversationService.getConversation({ id: target.conversation.id }, [...CONVERSATION_DEFAULT])

		const sender = await this.userService.getUser({ id: req.user.id })

		if (
			(sender.id === conversation.owner.id) ||
			(conversation.users.find((u) => { u.user.id === sender.id })?.isAdmin === true)
		) {

			await this.conversationService.muteUser(target, body.duration)
				.then(() => {
					this.notificationService.emit(
						conversation.users.map((u) => u.user),
						"conv_mute",
						{
							conversation: conversation,
							user: target.user,
							issuer: sender
						})
				})

		}
		else {
			throw new HttpUnauthorized("You are not owner nor an admin")
		}
	}


	@Route({
		method: Post('ban'),
		description: { summary: 'Mutes an user in a conversation', description: 'Mutes an user in a conversation. Only the owner or an admin is allowed to perform this action' }
	})
	async ban(@Req() req: Request, @Body() body: DTO.BanParams) {

		const target = await this.conversationService.getConversationUser({ id: body.conversation_user_id }, [...CONVERSATION_USER_DEFAULT])
		const conversation = await this.conversationService.getConversation({ id: target.conversation.id }, [...CONVERSATION_DEFAULT])

		const sender = await this.userService.getUser({ id: req.user.id })

		if (
			(sender.id === conversation.owner.id) ||
			(conversation.users.find((u) => { u.user.id === sender.id })?.isAdmin === true)
		) {

			await this.conversationService.banUser(target)

			return this.conversationService.removeUserFromConversation({ id: conversation.id }, target)
				.then(() => {
					this.notificationService.emit(
						conversation.users.map((u) => u.user),
						"conv_kick",
						{
							conversation: conversation,
							user: target.user,
							issuer: sender
						})
				})
		} else {
			throw new HttpUnauthorized("You are not owner nor an admin")
		}
	}

}