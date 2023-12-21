import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, ManyToMany } from 'typeorm'

import { User } from 'src/db/user'

@Entity()
export class Match {
	@PrimaryGeneratedColumn()
	id: number

	@CreateDateColumn()
	date: Date

	@ManyToMany(() => User, user => user.matches)
	players: User[]

	@ManyToOne(() => User, { nullable: true })
	winner: User
}
