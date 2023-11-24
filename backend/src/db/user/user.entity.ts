import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';

import { ConversationUser } from '../conversation/conversation_user.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;
  @Column()
  image:string

  @OneToMany(() => ConversationUser, (conv_user) => conv_user.user)
  conversations:ConversationUser[]

}
