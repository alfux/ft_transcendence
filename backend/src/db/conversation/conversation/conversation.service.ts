import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserService, User } from 'src/db/user'
import { MessageService } from 'src/db/conversation/message'
import { ConversationUser, ConversationUserInfos } from 'src/db/conversation/conversation_user'

import { AccessLevel, Conversation } from '.'
import { HttpBadRequest, HttpMissingArg, HttpNotFound } from 'src/exceptions'

import { FindOptions, FindMultipleOptions } from 'src/db/types'

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(ConversationUser)
    private convUserRepository: Repository<ConversationUser>,

    @InjectRepository(ConversationUserInfos)
    private userInfosRepository: Repository<ConversationUserInfos>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    private messageService: MessageService
  ) { }

  async getConversationUser(where: FindOptions<ConversationUser>, relations = [] as string[]) {
    const connection = await this.convUserRepository.findOne({ where: where, relations: relations })
    if (!connection)
      throw new HttpNotFound("Conversation user")
    return connection
  }

  async getConversationUsers(where: FindMultipleOptions<ConversationUser>, relations = [] as string[]) {
    const connection = await this.convUserRepository.find({ where: where, relations: relations })
    if (!connection)
      throw new HttpNotFound("Conversation user")
    return connection
  }

  async createConversationUser(user: User, conversation: Conversation) {
    return this.convUserRepository.save({
      user: user,
      conversation: conversation,
      messages: []
    })
  }

  async deleteConversationUser(where: FindOptions<Conversation>, clear_messages = false) {
    const conversationUser = await this.getConversationUser(where, (clear_messages ? ['messages'] : []))
    if (clear_messages)
      this.messageService.remove(conversationUser.messages)
    this.convUserRepository.remove(conversationUser)
  }

  async deleteConversationUsers(where: FindOptions<Conversation>, clear_messages = false) {
    const conversationUsers = await this.getConversationUsers(where, (clear_messages ? ['messages'] : []))
    conversationUsers.forEach((u) => {
      if (clear_messages)
        this.messageService.remove(u.messages)
      this.convUserRepository.remove(u)
    })
  }



  async getConversationUserInfos(where: FindOptions<ConversationUserInfos>, relations = [] as string[]) {
    const connection = await this.userInfosRepository.findOne({ where: where, relations: relations })
    if (!connection)
      throw new HttpNotFound("Conversation user infos")
    return connection
  }

  async getConversationUsersInfos(where: FindMultipleOptions<ConversationUserInfos>, relations = [] as string[]) {
    const connection = await this.userInfosRepository.find({ where: where, relations: relations })
    if (!connection)
      throw new HttpNotFound("Conversation user infos")
    return connection
  }

  async deleteConversationUserInfo(where: FindOptions<Conversation>) {
    const userInfo = await this.getConversationUserInfos(where)
    this.userInfosRepository.remove(userInfo)
  }

  async deleteConversationUserInfos(where: FindOptions<Conversation>) {
    const userInfos = await this.getConversationUsersInfos(where)
    userInfos.forEach((u) => {
      this.userInfosRepository.remove(u)
    })
  }



  async getConversation(where: FindOptions<Conversation>, relations = [] as string[]) {
    const connection = await this.conversationRepository.findOne({ where, relations, })
    if (!connection)
      throw new HttpNotFound("Conversation")
    return connection
  }

  async getConversations(where: FindMultipleOptions<Conversation>, relations = [] as string[]) {
    const connection = await this.conversationRepository.find({ where, relations, })
    if (!connection)
      throw new HttpNotFound("Conversation")
    return connection
  }

  async createConversation(user_id: number, title: string, access_level: AccessLevel, password: string) {
    if (access_level && access_level == AccessLevel.PROTECTED && password === undefined) {
      throw new HttpMissingArg()
    }

    //TODO: hash le password
    const user = await this.userService.getUser({ id: user_id })
    const new_conv_template = this.conversationRepository.create({
      title: title,
      owner: user,
      access_level: access_level,
      password: password,
      users: [],
      messages: []
    })
    const new_conv = await this.conversationRepository.save(new_conv_template)
    return await this.addUserToConversation({ id: new_conv.id }, user)
  }

  async deleteConversation(where: FindOptions<Conversation>) {
    this.getConversation(where, ['users', 'messages'])
      .then((conversation) => {
        return Promise.all([
          this.messageService.remove(conversation.messages),
          this.convUserRepository.remove(conversation.users),
          this.conversationRepository.remove(conversation)
        ])
      })
  }

  async addUserToConversation(where: FindOptions<Conversation>, user: User) {
    const conv = await this.getConversation(where, ["users"])

    let conv_user = await this.getConversationUser({ user: { id: user.id }, conversation: { id:conv.id } })
      .catch((e) => { if (e instanceof HttpNotFound) return undefined; else throw e })

    if (!conv_user) {
      const conv_ref = await this.conversationRepository.findOne({ where, relations: [] })
      conv_user = await this.createConversationUser(user, conv_ref)
    }
    conv.users.push(conv_user)
    return this.conversationRepository.save(conv)
  }

  async removeUserFromConversation(where: FindOptions<Conversation>, user: ConversationUser) {
    const conv = await this.getConversation(where, ['users'])
    conv.users = conv.users.filter(u => u.id != user.id)
    this.conversationRepository.save(conv)
  }

  async makeUserAdmin(user: ConversationUser) {
    user.isAdmin = true
    user.becameAdminAt = new Date()
    return this.convUserRepository.save(user)
  }




}
