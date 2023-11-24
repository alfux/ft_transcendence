import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Req,
  Param,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef
} from '@nestjs/common'

import { ApiBearerAuth, ApiTags, ApiProperty } from '@nestjs/swagger'

import { Request } from 'src/auth'
import { ConversationService } from './conversation.service'
import { Conversation, UserService } from 'src/db'

import { Route } from 'src/route'

class ConversationCreateParams {
  @ApiProperty({ description: 'Title of the conversation' })
  title: string
}

class ConversationIdParams {
  @ApiProperty({ description: 'Id of the conversation' })
  id: number
}

class PromoteParams {
  @ApiProperty({ description: 'Id of the conversation user to promote' })
  conversation_user_id: number
}

class KickParams {
  @ApiProperty({ description: 'Id of the conversation user to kick' })
  conversation_user_id: number
}

class MuteParams {
  @ApiProperty({ description: 'Id of the conversation user to mute' })
  conversation_user_id: number
  @ApiProperty({ description: 'Duration of the mute' ,
  examples: ['2042-12-31T23:42:42', '1d', '2y1d3m', 'forever']})
  duration: string | 'forever'
}

class BanParams {

  @ApiProperty({ description: 'Id of the conversation user to ban' })
  conversation_user_id: number
  @ApiProperty({ description: 'Duration of the ban' ,
  examples: ['2042-12-31T23:42:42', '1d', '2y1d3m', 'forever']})
  duration: string | 'forever'
}


@ApiBearerAuth()
@ApiTags('conversation')
@Controller('conversation')
export class ConversationController {

  constructor(
    private conversationService: ConversationService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) { }

  @Route({
    method: Get('me'),
    description: { summary: 'Get users\'s conversations', description: 'Return a list of all the conversations the authenticated user is in' },
    responses: [{ status: 200, description: 'List of conversations retrieved successfully' }]
  })
  async getMeConversations(@Req() req: Request) {
    return this.conversationService.getConversationsByUserId(req.user.id)
  }

  @Route({
    method: Get('own'),
    description: { summary: 'Get users\'s owned conversations', description: 'Return a list of all the conversations the authenticated user owns' },
    responses: [{ status: 200, description: 'List of conversations retrieved successfully' }]
  })
  getOwnConversations(@Req() req: Request) {
    return this.conversationService.getOwnConversationsByUserId(req.user.id)
  }

  @Route({
    method: Get('/'),
    description: { summary: 'Get all public conversations', description: 'Return a list of all the conversations that are marked as public' },
    responses: [{ status: 200, description: 'List of conversations retrieved successfully' }]
  })
  getAllConversations() {
    return this.conversationService.getConversations({}, ['users', 'users.user', 'owner'])
  }

  @Route({
    method: Post('/'),
    description: { summary: 'Create a conversation', description: 'Create a conversation. Owner will automatically be the creator' },
    responses: [{ status: 200, description: 'List of conversations retrieved successfully' }]
  })
  createConversation(@Req() req: Request, @Body() body: ConversationCreateParams) {
    return this.conversationService.createConversation(req.user.id, body.title)
  }

  @Route({
    method: Get(':id'),
    description: { summary: 'Get conversation content', description: 'Returns the conversation\'s messages' },
    responses: [{ status: 200, description: 'Conversation\'s content retrieved successfully' }]
  })
  async getConversation(@Param('id') id: number): Promise<Conversation> {
    return await this.conversationService.getConversation({ id: id }, ['users', 'users.user', 'owner', 'messages', 'messages.sender', 'messages.sender.user'])
  }

  @Route({
    method: Delete(':id'),
    description: { summary: 'Delete a conversation', description: 'Deletes a conversation' },
    responses: [{ status: 200, description: 'Conversation deleted successfully' }]
  })
  async deleteConversation(@Req() req: Request, @Param('id') id: number) {

    const conversation = await this.conversationService.getConversation({ id: id }, ['owner'])
    if (!conversation)
      return
    if (req.user.id != conversation.owner.id)
      throw new HttpException('You do not own this conversation', HttpStatus.BAD_REQUEST)
    this.conversationService.deleteConversation({id:id})
  }

  @Route({
    method: Post('join'),
    description: { summary: 'Join a conversation', description: 'Makes the authenticated user join the conversation' },
    responses: [{ status: 200, description: 'Conversation joined successfully' }]
  })
  async joinConversation(@Req() req: Request, @Body() body: ConversationIdParams) {
    const user = await this.userService.getUser({ id: req.user.id })
    this.conversationService.addUserToConversation({ id: body.id }, user)
  }

  @Route({
    method: Post('promote'),
    description: { summary: 'Promotes a user to admin', description: 'Promotes a user to admin. Only the owner is allowed to perform this action' },
    responses: [{ status: 200, description: 'Conversation joined successfully' }]
  })
  async promote(@Req() req: Request, @Body() body: PromoteParams) {
    const conv_user = await this.conversationService.getConversationUser({id:body.conversation_user_id}, ['conversation', 'conversation.owner'])
    if (conv_user.conversation.owner.id !== req.user.id)
      throw new HttpException('Not authorized', HttpStatus.BAD_REQUEST)
    this.conversationService.makeUserAdmin(conv_user)
  }

  @Route({
    method: Post('kick'),
    description: { summary: 'Kicks an user from the conversation', description: 'Kicks an user from the conversation. Only the owner or an admin is allowed to perform this action' }
  })
  async kick(@Req() req: Request, @Body() body: KickParams) {

    const conv_user = await this.conversationService.getConversationUser({id:body.conversation_user_id}, ['conversation', 'conversation.owner'])
    const sender = await this.userService.getUser({id:req.user.id})

    if (
      (sender.id === conv_user.conversation.owner.id) ||
      (conv_user.conversation.users.find((u) => { u.user.id === sender.id })?.isAdmin)
    ) {
      //TODO: notify kick
      this.conversationService.removeUserFromConversation({id:conv_user.conversation.id}, conv_user)
    } else {
      throw new HttpException('Not allowed', HttpStatus.BAD_REQUEST)
    }
  }

  @Route({
    method: Post('mute'),
    description: { summary: 'Mutes an user in a conversation', description: 'Mutes an user in a conversation. Only the owner or an admin is allowed to perform this action' }
  })
  async mute(@Req() req: Request, @Body() body: KickParams) {

    const conv_user = await this.conversationService.getConversationUser({id:body.conversation_user_id}, ['conversation', 'conversation.owner'])
    const sender = await this.userService.getUser({id:req.user.id})

    if (!(
      (sender.id === conv_user.conversation.owner.id) ||
      (conv_user.conversation.users.find((u) => { u.user.id === sender.id })?.isAdmin))
    ) {
      throw new HttpException('Not allowed', HttpStatus.BAD_REQUEST)
    }

    //TODO: notify mute
    
  }

  @Route({
    method:Post('leave'),
    description:{summary:'Leaves a conversation', description:'Makes the authenticated user leave the conversation'},
    responses:[{ status: 200, description: 'Conversation left successfully' }]
  })
  async leaveConversation(@Req() req: Request, @Body() body:ConversationIdParams) {
    const conv_user = await this.conversationService.getConversationUser({user:{id:req.user.id}})
    this.conversationService.removeUserFromConversation({id:body.id}, conv_user)
  }
}