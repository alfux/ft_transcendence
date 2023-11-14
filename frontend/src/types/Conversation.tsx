import { User } from './User'
import { Message } from './Message'

export interface Conversation {
  id: number;
  title: string
  owner: User
  users: User[]
  messages: Message[]
}