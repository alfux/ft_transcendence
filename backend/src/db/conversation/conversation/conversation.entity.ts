import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'

import { User } from 'src/db/user'
import { Message } from 'src/db/conversation/message'
import { ConversationUser, ConversationUserInfos } from 'src/db/conversation'

import { AccessLevel } from '.'

@Entity()
export class Conversation {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	title: string

	@Column({
		type: 'enum',
		enum: AccessLevel,
		default: AccessLevel.PUBLIC,
	})
	access_level: AccessLevel

	@Column({ nullable: true, select: false })
	password?: string

	@Column({ default: false })
	isPrivateConversation: boolean

	@ManyToOne(() => User)
	@JoinColumn()
	owner: User

	@OneToMany(() => ConversationUser, (conversationUser) => conversationUser.conversation)
	users: ConversationUser[]

	@OneToMany(() => ConversationUserInfos, (conversationUserInfos) => conversationUserInfos.conversation)
	users_admin_infos: ConversationUserInfos[]

	@OneToMany(() => Message, (message) => message.conversation)
	messages: Message[]
}
