import { Conversation } from "./Conversation";
import { Message } from "./Message";

export interface User {
  id: number;
  username: string;
  image:string

  own_conversations: Conversation[]
  conversations: Conversation[]
  messages: Message[]

}