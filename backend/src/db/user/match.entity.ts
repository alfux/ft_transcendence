import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  date: Date;

  @ManyToMany(() => User, user => user.matches)
  players: User[];

  @ManyToOne(() => User, { nullable: true })
  winner: User;
}
