import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'

import { User } from 'src/db/user'
import { Conversation } from 'src/db/conversation'

@Entity()
export class ConversationUserInfos {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => User)
	@JoinColumn()
	user: User

	@ManyToOne(() => Conversation, (conversation) => conversation.users_admin_infos)
	@JoinColumn()
	conversation: Conversation

	@Column({ default: false })
	banned: boolean
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	bannedAt: Date

	@Column({ default: false })
	muted: boolean
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	mutedAt: Date
}