import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne, PrimaryColumn } from 'typeorm';

import { ConversationUser } from '../conversation/conversation_user.entity';
import { FriendRequest } from './friend_request.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  username: string;
  @Column()
  image:string

  @OneToMany(() => ConversationUser, (conv_user) => conv_user.user)
  conversations:ConversationUser[]

  @ManyToMany(() => User)
  @JoinTable()
  blocked:User[]

  @ManyToMany(() => User)
  @JoinTable()
  friends:User[]

  @OneToMany(() => FriendRequest, (fr) => fr.receiver)
  friends_requests_recv:FriendRequest[]

  @OneToMany(() => FriendRequest, (fr) => fr.sender)
  friends_requests_sent:FriendRequest[]
}
