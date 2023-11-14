import { Body, Controller, Get, Post, Delete, Req, UseGuards, Param } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { Request } from 'src/auth'
import { Conversation } from './conversation.entity'
import { ConversationService } from './conversation.service'
import { Message, UserService } from 'src/db'

function filter_conversations_content(convs:Conversation[])
{
  if (!convs)
    return []

  return convs.map((conv) => {return {id:conv.id,
      owner:conv.owner,
      title:conv.title,
      users:conv.users?.map((user) => {return {id:user.id, username:user.username, image:user.image}})
    }})
}


@Controller('conversation')
export class ConversationController {

  constructor(
    private conversationService: ConversationService,
    private userService: UserService
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getMeConversations(@Req() req: Request)
  {
    const user = await this.userService.getUser({id:req.user.id}, ['conversations'])
    const all_convs = filter_conversations_content(user.conversations)

    return all_convs.map((value) => {return {
      id:value.id,
      owner:value.owner,
      title:value.title,
      users:value.users.map((value) => {return {
        id:value.id,
        username:value.username,
        image:value.image,
      }})
    }})
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('own')
  async getOwnConversations(@Req() req: Request)
  {
    const user = await this.userService.getUser({id:req.user.id})
    const convs = await this.conversationService.getConversations({
      owner:user
    }, ['users'])
    return filter_conversations_content(convs)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createConversation(@Req() req: Request, @Body() body) {
    const user = req.user
    const conversation = await this.conversationService.createConversation(user.id, body.title)
    return {
      id:conversation.id,
      owner:conversation.owner,
      title:conversation.title,
      users:conversation.users.map((conversation) => {return {
        id:conversation.id,
        username:conversation.username,
        image:conversation.image,
      }})
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/content')
  async getConversationContent(@Param('id') id: number): Promise<Message[]>
  {
    const conv = await this.conversationService.getConversation({id:id}, ['messages'])
    return conv.messages
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteConversation(@Param('id') id: number) {
    this.conversationService.deleteConversationById(id)
  }
  

}