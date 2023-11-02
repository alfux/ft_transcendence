import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    nickName: string;
    
    @Column()
    email:string;
    
    @Column()
    lastTimeLogged :Date;

    @Column({ default :false })
    isLogged : boolean;
}