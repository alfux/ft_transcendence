import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';

import { Message } from '../message/message.entity';
import { Conversation } from '../conversation/conversation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;
  @Column()
  image:string
  
  @OneToMany(() => Conversation, (conv) => conv.owner)
  own_conversations: Conversation[]

  @ManyToMany(() => Conversation, (conv) => conv.users)
  @JoinTable()
  conversations: Conversation[]

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[]

}
