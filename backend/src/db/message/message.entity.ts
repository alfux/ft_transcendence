import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Conversation } from '../conversation/conversation.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Conversation, (conv) => conv.messages, { onDelete: 'CASCADE' })
  conversation: Conversation

  @ManyToOne(() => User, (user) => user)
  sender: User;
}
