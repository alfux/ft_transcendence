import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

import { Message } from '../message/message.entity';
import { User } from '../user/user.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string

  @ManyToOne(() => User, (user) => user.own_conversations)
  owner: User

  @ManyToMany(() => User, (user) => user.conversations)
  users: User[]

  @OneToMany(() => Message, (msg) => msg.conversation, {cascade:true})
  messages: Message[]
}
