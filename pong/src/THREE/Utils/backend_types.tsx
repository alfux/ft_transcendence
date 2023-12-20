export enum LoggedStatus {
	Logged,
	InGame,
	Incomplete,
	Unlogged,
}

export enum GameMode {
	CLASSIC = "CLASSIC",
	MAGNUS = "MAGNUS",
}

export enum ChatEvents {
	RECEIVE_MESSAGE = "receive_message"
}

export enum PrivateChatEvents {
	RECEIVE_MESSAGE = "receive_message"
}

export enum NotificationEvent {
	USER_CREATE = "user_create",
	
	CONV_CREATE = "conv_create",
	CONV_DELETE = "conv_delete",
	CONV_JOIN = "conv_join",
	CONV_LEAVE = "conv_leave",
	CONV_PROMOTE = "conv_promote",
	CONV_KICK = "conv_kick",
	CONV_MUTE = "conv_mute",

	FRIEND_REQUEST_RECV = "friend_request_recv",
	FRIEND_REQUEST_ACCEPTED = "friend_request_accepted",
	FRIEND_REQUEST_DENIED = "friend_request_denied",

	PLAY_REQUEST_RECV = "play_request_recv",
	PLAY_REQUEST_ACCEPTED = "play_request_accepted",
	PLAY_REQUEST_DENIED = "play_request_denied",

	FRIEND_NEW = "friend_new",
	FRIEND_DELETE = "friend_delete",

	BLOCKED_NEW = "blocked_new",
	BLOCKED_DELETE = "blocked_delete",
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

	sender: User
	receiver: User
}

export interface PlayRequest {
	id: number
	sender: User
	receiver: User
}

export interface Message {
	id: number

	sender: ConversationUser
	conversation?: Conversation

	content: string
}

export interface Conversation {
	id: number
	title: string
	access_level: AccessLevel
	owner: User
	users: ConversationUser[]
	messages?: Message[]
}

export interface ConversationUser {
	id: number

	user: User
	conversation: Conversation

	joinedAt: Date

	isAdmin: boolean
	becameAdminAt: string

	messages?: Message[]
}


export interface PrivateMessage {
	id: number

	sender: User
	conversation: PrivateConversation

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

	players: User[]
	winner: User
}
