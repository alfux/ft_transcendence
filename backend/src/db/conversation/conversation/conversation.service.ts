import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere } from 'typeorm'

import { UserService, User } from 'src/db/user'
import { MessageService } from 'src/db/conversation/message'
import { ConversationUser, ConversationUserInfos } from 'src/db/conversation/conversation_user'

import { AccessLevel, Conversation } from '.'
import { HttpBadRequest, HttpMissingArg, HttpNotFound } from 'src/exceptions'

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

  async getConversationUser(where: FindOptionsWhere<ConversationUser>, relations = [] as string[]) {
    const connection = await this.convUserRepository.findOne({ where: where, relations: relations })
    if (!connection)
      throw new HttpNotFound("Conversation user")
    return connection
  }

  async getConversationUsers(where: FindOptionsWhere<ConversationUser>, relations = [] as string[]) {
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

  async deleteConversationUser(where: FindOptionsWhere<Conversation>, clear_messages = false) {
    const conversationUser = await this.getConversationUser(where, (clear_messages ? ['messages'] : []))
    if (clear_messages)
      this.messageService.remove(conversationUser.messages)
    this.convUserRepository.remove(conversationUser)
  }

  async deleteConversationUsers(where: FindOptionsWhere<Conversation>, clear_messages = false) {
    const conversationUsers = await this.getConversationUsers(where, (clear_messages ? ['messages'] : []))
    conversationUsers.forEach((u) => {
      if (clear_messages)
        this.messageService.remove(u.messages)
      this.convUserRepository.remove(u)
    })
  }



  async getConversationUserInfos(where: FindOptionsWhere<ConversationUserInfos>, relations = [] as string[]) {
    const connection = await this.userInfosRepository.findOne({ where: where, relations: relations })
    if (!connection)
      throw new HttpNotFound("Conversation user infos")
    return connection
  }

  async getConversationUsersInfos(where: FindOptionsWhere<ConversationUserInfos>, relations = [] as string[]) {
    const connection = await this.userInfosRepository.find({ where: where, relations: relations })
    if (!connection)
      throw new HttpNotFound("Conversation user infos")
    return connection
  }

  async deleteConversationUserInfo(where: FindOptionsWhere<Conversation>) {
    const userInfo = await this.getConversationUserInfos(where)
    this.userInfosRepository.remove(userInfo)
  }

  async deleteConversationUserInfos(where: FindOptionsWhere<Conversation>) {
    const userInfos = await this.getConversationUsersInfos(where)
    userInfos.forEach((u) => {
      this.userInfosRepository.remove(u)
    })
  }



  async getConversation(where: FindOptionsWhere<Conversation>, relations = [] as string[]) {
    const connection = await this.conversationRepository.findOne({ where, relations, })
    if (!connection)
      throw new HttpNotFound("Conversation")
    return connection
  }

  async getConversations(where: FindOptionsWhere<Conversation>, relations = [] as string[]) {
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
    const new_conv = await this.conversationRepository.save({
      title: title,
      owner: user,
      access_level: access_level,
      password: password,
      users: [],
      messages: []
    })
    return await this.addUserToConversation({ id: new_conv.id }, user)
  }

  async deleteConversation(where: FindOptionsWhere<Conversation>) {
    this.getConversation(where, ['users', 'messages'])
      .then((conversation) => {
        return Promise.all([
          this.messageService.remove(conversation.messages),
          this.convUserRepository.remove(conversation.users),
          this.conversationRepository.remove(conversation)
        ])
      })
  }

  async addUserToConversation(where: FindOptionsWhere<Conversation>, user: User) {
    const conv = await this.getConversation(where, ["users"])

    let conv_user = await this.getConversationUser({ user: { id: user.id } })
      .catch((e) => { if (e instanceof HttpNotFound) return undefined; else throw e })

    if (!conv_user) {
      const conv_ref = await this.conversationRepository.findOne({ where, relations: [] })
      conv_user = await this.createConversationUser(user, conv_ref)
    }
    conv.users.push(conv_user)
    return this.conversationRepository.save(conv)
  }

  async removeUserFromConversation(where: FindOptionsWhere<Conversation>, user: ConversationUser) {
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
