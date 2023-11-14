// auth.controller.ts

import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { userInfo } from 'os'

import { AuthService, Public } from 'src/auth'
import { User42Api } from 'src/auth/42api/user42api.interface'

import { UserService, MessageService, ConversationService, User, Conversation } from 'src/db'

@Controller('debug')
export class DebugController {
  
  constructor(
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
    private readonly msgService: MessageService,
    private readonly authService: AuthService
  ) {}

  @Public()
  @Post('add_user')
  @UsePipes(ValidationPipe)
  add_user(@Body() body:User42Api): Promise<User> {
    return this.userService.createUser(body)
  }

  @Public()
  @Post('add_conv')
  @UsePipes(ValidationPipe)
  add_conv(@Body() body:{userId:number, title:string}): Promise<Conversation> {
    return this.conversationService.createConversation(body.userId, body.title)
  }

  @Public()
  @Post('add_user_to_conv')
  @UsePipes(ValidationPipe)
  async add_user_to_conv(@Body() body:{conv_title:string, username:string}) {
    const user = await this.userService.getUser({username:body.username})
    //this.conversationService.addUserToConversation(body.conv_title, user)
  }

  @Public()
  @Post('log_as')
  @UsePipes(ValidationPipe)
  async log_as(@Body() body:{username:string}) {
    const user = await this.userService.getUser({username:body.username})
    const token = await this.authService.getJwt({id:user.id, username:user.username, image:user.image})
    console.log('new token: ' , token)
    return {token:token}
  }

  @Public()
  @Get('all_users')
  get_all_users() {
    return this.userService.getUsers()
  }

}