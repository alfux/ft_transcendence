import { Body, Controller, Get, Post, Delete, Req, Param, HttpException, Inject, forwardRef } from '@nestjs/common'

import { ApiBearerAuth, ApiTags, ApiProperty } from '@nestjs/swagger'

import { Request } from 'src/auth/interfaces/'
import { UserService } from 'src/db/user'
import { ConversationService } from './conversation.service'
import { NotificationsService } from 'src/notifications/'
import { HttpMissingArg, HttpUnauthorized } from 'src/exceptions'

import { Route } from 'src/route'
import { AccessLevel } from './conversation_access_level.enum'
import { unescape } from 'querystring'

class ConversationCreateParams {
  @ApiProperty({ description: 'Title of the conversation' })
  title: string
  @ApiProperty({ description: 'Private or not' })
  private: boolean
  @ApiProperty({ description: 'Password of the conversation (empty if no password)' })
  password?: string | ""
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
  @ApiProperty({
    description: 'Duration of the mute',
    examples: ['2042-12-31T23:42:42', '1d', '2y1d3m', 'forever']
  })
  duration: string | 'forever'
}
class BanParams {

  @ApiProperty({ description: 'Id of the conversation user to ban' })
  conversation_user_id: number
  @ApiProperty({
    description: 'Duration of the ban',
    examples: ['2042-12-31T23:42:42', '1d', '2y1d3m', 'forever']
  })
  duration: string | 'forever'
}


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
    return this.conversationService.getConversation({ users: { user: { id:req.user.id } } }, ['users', 'owner', 'conversations', 'conversations.conversation'])
    .catch((e) => {
      if (e instanceof HttpException && e.getStatus() === 400) {
        return []
      }
    })
  }

  @Route({
    method: Get('own'),
    description: { summary: 'Get users\'s owned conversations', description: 'Return a list of all the conversations the authenticated user owns' },
    responses: [{ status: 200, description: 'List of conversations retrieved successfully' }]
  })
  getOwnConversations(@Req() req: Request) {
    return this.conversationService.getConversation({ owner: { id:req.user.id } }, ['users', 'owner'])
    .catch((e) => {
      if (e instanceof HttpException && e.getStatus() === 400) {
        return []
      }
    })
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
  async createConversation(@Req() req: Request, @Body() body: ConversationCreateParams) {
    if (body.title === undefined)
      throw new HttpMissingArg()

    let access_level = AccessLevel.PUBLIC
    if (body.private)
      access_level = AccessLevel.PRIVATE

    if (body.password !== undefined && body.password.length > 0) {
      access_level = AccessLevel.PROTECTED
    }

    if (body.password === undefined)
      body.password = ""

    const conversation = await this.conversationService.createConversation(req.user.id, body.title, access_level, body.password)
    this.notificationService.emit_everyone(
      "conv_create",
      {
        conversation: conversation
      })
      console.log("done")
    return conversation
  }

  @Route({
    method: Get(':id'),
    description: { summary: 'Get conversation content', description: 'Returns the conversation\'s messages' },
    responses: [{ status: 200, description: 'Conversation\'s content retrieved successfully' }]
  })
  async getConversation(@Param('id') id: number) {
    if (id === undefined)
      throw new HttpMissingArg()
    return this.conversationService.getConversation({ id: id }, [
      'users',
      'users.user',
      
      'owner',
      
      'messages',
      'messages.sender',
      'messages.sender.user'
    ])
    .then((v) => {
      if (v.users.find((x) => x.id === id) === undefined)
        throw new HttpUnauthorized()
      return v
    })
  }

  @Route({
    method: Delete(':id'),
    description: { summary: 'Delete a conversation', description: 'Deletes a conversation' },
    responses: [{ status: 200, description: 'Conversation deleted successfully' }]
  })
  async deleteConversation(@Req() req: Request, @Param('id') id: number) {

    const conversation = await this.conversationService.getConversation({ id: id }, ['owner'])
    this.notificationService.emit_everyone(
      "conv_delete",
      {
        conversation: conversation
      })
    if (!conversation)
      return
    if (req.user.id != conversation.owner.id)
      throw new HttpUnauthorized()
    this.conversationService.deleteConversation({ id: id })
  }

  @Route({
    method: Post('join'),
    description: { summary: 'Join a conversation', description: 'Makes the authenticated user join the conversation' },
    responses: [{ status: 200, description: 'Conversation joined successfully' }]
  })
  async joinConversation(@Req() req: Request, @Body() body: ConversationIdParams) {
    if (body.id === undefined)
      throw new HttpMissingArg()
    const user = await this.userService.getUser({ id: req.user.id })
    const conversation = await this.conversationService.getConversation({ id: body.id }, ['users', 'users.user'])
    this.notificationService.emit(
      conversation.users.map((u) => u.user),
      "conv_join",
      {
        conversation: conversation,
        user: user
      })

    this.conversationService.addUserToConversation({ id: body.id }, user)
  }

  @Route({
    method: Post('promote'),
    description: { summary: 'Promotes a user to admin', description: 'Promotes a user to admin. Only the owner is allowed to perform this action' },
    responses: [{ status: 200, description: 'Conversation joined successfully' }]
  })
  async promote(@Req() req: Request, @Body() body: PromoteParams) {
    if (body.conversation_user_id === undefined)
      throw new HttpMissingArg()
    const conv_user = await this.conversationService.getConversationUser({ id: body.conversation_user_id }, ['conversation', 'conversation.owner', 'conversation.users', 'conversation.users.user', 'user'])
    if (conv_user.conversation.owner.id !== req.user.id)
      throw new HttpUnauthorized()

    this.notificationService.emit(
      conv_user.conversation.users.map((u) => u.user),
      "conv_promote",
      {
        conversation: conv_user.conversation,
        user: conv_user.user
      })

    this.conversationService.makeUserAdmin(conv_user)
  }

  @Route({
    method: Post('kick'),
    description: { summary: 'Kicks an user from the conversation', description: 'Kicks an user from the conversation. Only the owner or an admin is allowed to perform this action' }
  })
  async kick(@Req() req: Request, @Body() body: KickParams) {
    if (body.conversation_user_id === undefined)
      throw new HttpMissingArg()
    const conv_user = await this.conversationService.getConversationUser({ id: body.conversation_user_id }, ['user', 'conversation', 'conversation.owner', 'conversation.users', 'conversation.users.user'])
    const sender = await this.userService.getUser({ id: req.user.id })

    if (
      (sender.id === conv_user.conversation.owner.id) ||
      (conv_user.conversation.users.find((u) => { u.user.id === sender.id })?.isAdmin)
    ) {
      this.notificationService.emit(
        conv_user.conversation.users.map((u) => u.user),
        "conv_kick",
        {
          conversation: conv_user.conversation,
          user: conv_user.user,
          issuer: sender
        })

      this.conversationService.removeUserFromConversation({ id: conv_user.conversation.id }, conv_user)
    } else {
      throw new HttpUnauthorized()
    }
  }

  @Route({
    method: Post('mute'),
    description: { summary: 'Mutes an user in a conversation', description: 'Mutes an user in a conversation. Only the owner or an admin is allowed to perform this action' }
  })
  async mute(@Req() req: Request, @Body() body: KickParams) {
    if (body.conversation_user_id === undefined)
      throw new HttpMissingArg()
    const conv_user = await this.conversationService.getConversationUser({ id: body.conversation_user_id }, ['conversation', 'conversation.owner'])
    const sender = await this.userService.getUser({ id: req.user.id })

    if (!(
      (sender.id === conv_user.conversation.owner.id) ||
      (conv_user.conversation.users.find((u) => { u.user.id === sender.id })?.isAdmin))
    ) {
      throw new HttpUnauthorized()
    }

    this.notificationService.emit(
      conv_user.conversation.users.map((u) => u.user),
      "conv_mute",
      {
        conversation: conv_user.conversation,
        user: conv_user.user,
        issuer: sender
      })
  }

  @Route({
    method: Post('leave'),
    description: { summary: 'Leaves a conversation', description: 'Makes the authenticated user leave the conversation' },
    responses: [{ status: 200, description: 'Conversation left successfully' }]
  })
  async leaveConversation(@Req() req: Request, @Body() body: ConversationIdParams) {
    if (body.id === undefined)
      throw new HttpMissingArg()
    const conv_user = await this.conversationService.getConversationUser({ user: { id: req.user.id } }, ['conversation', 'conversation.users', 'conversation.users.user', 'user'])
    this.conversationService.removeUserFromConversation({ id: body.id }, conv_user)

    this.notificationService.emit(
      conv_user.conversation.users.map((u) => u.user),
      "conv_leave",
      {
        conversation: conv_user.conversation,
        user: conv_user.user
      })
  }
}