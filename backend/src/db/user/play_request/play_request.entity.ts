import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'

import { User } from 'src/db/user'

@Entity()
export class PlayRequest {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => User, (user) => user.play_requests_sent)
	sender: User

	@ManyToOne(() => User, (user) => user.play_requests_recv)
	receiver: User
}