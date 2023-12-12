export enum LoggedStatus {
    Logged,
    Incomplete,
    Unlogged,
}

export interface User {
    id:number
    username:string
    image:string
    isAuthenticated:LoggedStatus
    conversations?:ConversationUser[]
    blocked?:User[]
    friends?:User[]
    friends_requests_recv?:FriendRequest[]
    friends_requests_sent?:FriendRequest[]
}

export interface FriendRequest {
    id:number
    sender?:{
        db_id:number,
        id:number,
        username:string,
        image:string,
        email:string
    }
    receiver?:User
}

export interface Message {
    id:number
    content:string
    sender?:ConversationUser
    conversation?:Conversation
}

export interface Conversation {
    id:number
    title:string
    owner?:User
    users?:User[]
    messages?:Message[]
}

export interface ConversationUser {
    id:number
    joinedAt:Date
    isAdmin:boolean
    becameAdminAt:Date
    user?:User
    conversation?:Conversation
    messages?:Message[]
}
