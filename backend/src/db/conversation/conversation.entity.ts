import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../user'
import { Message } from '../message'
import { ConversationUser } from './conversation_user.entity'
import { ConversationUserInfos } from './conversation_user_infos.entity'

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User

  @OneToMany(() => ConversationUser, (conversationUser) => conversationUser.conversation)
  users: ConversationUser[]

  @OneToMany(() => ConversationUserInfos, (conversationUserInfos) => conversationUserInfos.conversation)
  users_admin_infos: ConversationUserInfos[]

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[]
}
