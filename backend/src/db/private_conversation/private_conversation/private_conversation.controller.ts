import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common'

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Request } from 'src/auth/interfaces/'
import { PrivateConversationService } from './private_conversation.service'

import { Route } from 'src/route'
import { HttpBadRequest, HttpNotFound } from 'src/exceptions'

@ApiBearerAuth()
@ApiTags('private_conversation')
@Controller('private_conversation')
export class PrivateConversationController {

	constructor(
		private privateConversationService: PrivateConversationService,
	) { }

	@Route({
		method: Get(':id'),
		description: { description: 'Get a conversation content' },
		responses: [{ status: 200, description: 'Conversation retrieved successfully' }]
	})
	async getConversationsById(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {

		if (req.user.id === id)
			throw new HttpBadRequest()

		const convs = await Promise.all((await this.privateConversationService.getPrivateConversationByUserId(req.user.id)).map(
			(c) => this.privateConversationService.getPrivateConversation({id: c.id}, ['users', 'messages', 'messages.sender'])
		))

		const private_conv = convs.find((c) => {
			const has_other_user = 	c.users.find((u) => u.id === id) !== undefined
			const has_own_user = c.users.find((u) => u.id === req.user.id) !== undefined
			return has_other_user && has_own_user && c.users.length === 2
		})
		if (private_conv === undefined)
			throw new HttpNotFound("Private conversation")

		return private_conv
	}

}