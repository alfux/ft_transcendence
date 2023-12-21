import { Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm'

import { User } from 'src/db/user'
import { PrivateMessage } from 'src/db/private_conversation/private_message'


@Entity()
export class PrivateConversation {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToMany(() => User, user => user.privateConversations)
	@JoinTable()
	users: User[]

	@OneToMany(() => PrivateMessage, (message) => message.conversation)
	messages: PrivateMessage[]
}
