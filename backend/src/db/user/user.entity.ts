import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'

import { ConversationUser } from 'src/db/conversation'
import { FriendRequest } from './friend_request/'
import { PlayRequest } from './play_request/'
import { Match } from './match'

import { LoggedStatus } from '.'
import { PrivateConversation } from '../private_conversation'

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	db_id: number

	@Column()
	id: number
	@Column()
	username: string
	@Column()
	image: string
	@Column()
	email: string


	@Column({
		type: 'enum',
		enum: LoggedStatus,
		default: LoggedStatus.Unlogged,
	})
	isAuthenticated: LoggedStatus


	@Column({ default: false, select: false })
	twoFactorAuth: boolean
	@Column({ default: '', select: false })
	twoFactorAuthSecret: string


	@OneToMany(() => ConversationUser, (conv_user) => conv_user.user)
	conversations: ConversationUser[]

	@ManyToMany(() => PrivateConversation, (conv) => conv.users)
	private_conversations: PrivateConversation[]

	@ManyToMany(() => User)
	@JoinTable()
	blocked: User[]

	@ManyToMany(() => User)
	@JoinTable()
	friends: User[]

	@OneToMany(() => FriendRequest, (fr) => fr.receiver)
	friends_requests_recv: FriendRequest[]
	@OneToMany(() => FriendRequest, (fr) => fr.sender)
	friends_requests_sent: FriendRequest[]

	@OneToMany(() => PlayRequest, (pr) => pr.receiver)
	play_requests_recv: PlayRequest[]
	@OneToMany(() => PlayRequest, (pr) => pr.sender)
	play_requests_sent: PlayRequest[]


	@ManyToMany(() => Match, match => match.players)
	@JoinTable()
	matches: Match[]
}
