import { Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm'

import { User } from 'src/db/user'
import { Message } from 'src/db/conversation/message'


@Entity()
export class PrivateConversation {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToMany(() => User, user => user.privateConversations, { eager: true })
  @JoinTable()
  users: User[]

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[]
}
