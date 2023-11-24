import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    nickName: string;
    
    @Column()
    firstName: string;
    
    @Column()
    lastName: string;
    
    @Column()
    email:string;

    @Column()
    avatar:string
    
    @Column()
    creationDate:Date;

    @Column()
    lastTimeLogged :Date;

    @Column()
    refreshToken: string;

    @Column({default: false})
    twoFactorAuth:boolean

    @Column({default:''})
    twoFactorAuthSecret:string;


}