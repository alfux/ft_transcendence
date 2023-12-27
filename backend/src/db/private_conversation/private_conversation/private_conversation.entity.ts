import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm'

import { User } from 'src/db/user'
import { PrivateMessage } from '../private_message'

@Entity()
export class PrivateConversation {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToMany(() => User, (user) => user.private_conversations)
	@JoinTable()
	users: User[]

	@OneToMany(() => PrivateMessage, (message) => message.conversation)
	messages: PrivateMessage[]
}
