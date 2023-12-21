import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Req, forwardRef } from '@nestjs/common'
import { ApiBearerAuth, ApiTags, ApiProperty } from '@nestjs/swagger'

import { Request } from 'src/auth/interfaces/request.interface'
import { User, UserService } from 'src/db/user'
import { PrivateConversationService } from '.'

import { Route } from 'src/route'
import * as DTO from './private_conversation.dto'

@ApiBearerAuth()
@ApiTags('private_conversation')
@Controller('private_conversation')
export class PrivateConversationController {

	constructor(
		private conversationService: PrivateConversationService,

		@Inject(forwardRef(() => UserService))
		private userService: UserService,

		private privateConvService: PrivateConversationService

	) { }

	@Route({
		method: Get('/:user_id'),
		description: { summary: 'Get users\'s private conversations with someone else', description: 'Get users\'s private conversations with someone else' },
	})
	async getConversationByUserId(@Req() req: Request, @Param('user_id', ParseIntPipe) user_id: number) {
		return this.privateConvService.getPrivateConversation({
			users: [{
				id: user_id
			}, {
				id: req.user.id
			}]
		}, ['users', 'messages'])
	}

	/*
	@Route({
		method: Post('/'),
		description: { summary: 'Starts a new private conversation', description: 'Starts a new private conversation' }
	})
	async newPrivateConv(@Req() req: Request, @Body() body: DTO.NewPrivateConvParams) {
		await this.userService.getUser({ id: req.user.id })
		await this.userService.getUser({ id: body.user_id })
		this.conversationService.createPrivateConversation(req.user.id, body.user_id)
	}
	*/
}