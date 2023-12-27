import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'

import { PrivateConversation } from 'src/db/private_conversation'
import { User } from 'src/db/user'

@Entity()
export class PrivateMessage {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => User, { onDelete: 'CASCADE' }) //{ onDelete: 'SET NULL' }
	@JoinColumn()
	sender: User

	@ManyToOne(() => PrivateConversation, (conversation) => conversation.messages)
	@JoinColumn()
	conversation: PrivateConversation

	@Column()
	content: string

	@CreateDateColumn()
	createdAt: Date
}
