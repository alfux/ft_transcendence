import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm'

import { User } from 'src/db/user'
import { Message } from 'src/db/conversation/message'
import { Conversation } from 'src/db/conversation'

@Entity()
export class ConversationUser {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.conversations)
  @JoinColumn()
  user: User

  @ManyToOne(() => Conversation, (conversation) => conversation.users)
  @JoinColumn()
  conversation: Conversation

  @CreateDateColumn()
  joinedAt: Date

  @Column({ default: false })
  isAdmin: boolean
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  becameAdminAt: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  mutedUntil: Date

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[]
}