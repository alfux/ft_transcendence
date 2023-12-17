export enum LoggedStatus {
  Logged,
  Incomplete,
  Unlogged,
}

export enum AccessLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
}

export interface User {
  db_id: number
  id: number
  username: string
  image: string
  email: string

  isAuthenticated: LoggedStatus

  twoFactorAuth?: boolean
  twoFactorAuthSecret?: string

  conversations?: ConversationUser[]
  privateConversations?: PrivateConversation[]

  blocked?: User[]
  friends?: User[]

  friends_requests_recv?: FriendRequest[]
  friends_requests_sent?: FriendRequest[]


  play_requests_recv?: PlayRequest[]
  play_requests_sent?: PlayRequest[]
}

export interface FriendRequest {
  id: number

  sender?: User
  receiver?: User
}

export interface PlayRequest {
  id: number
  sender?: User
  receiver?: User
}

export interface Message {
  id: number

  sender?: ConversationUser
  conversation?: Conversation

  content: string
}

export interface Conversation {
  id: number
  title: string
  access_level: AccessLevel
  owner?: User
  users?: ConversationUser[]
  messages?: Message[]
}

export interface ConversationUser {
  id: number

  user?: User
  conversation?: Conversation

  joinedAt: Date

  isAdmin: boolean
  becameAdminAt: string

  messages?: Message[]
}


export interface PrivateMessage {
  id: number

  sender?: User
  conversation?: PrivateConversation

  content: string
}


export interface PrivateConversation {
  id: number
  users?: User[]
  messages?: PrivateMessage[]
}

export interface Match {
  id: number

  date: Date

  players?: User[]
  winner?: User
}
