import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'

import { User } from 'src/db/user'
import { PrivateConversation } from 'src/db/private_conversation'

@Entity()
export class PrivateMessage {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => User)
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
