import { IsEmail, IsNotEmpty } from "class-validator";

export class UserDto{
    id: string;
    nickName: string;
    firstName: string;
    lastName: string;
    email:string;
    avatar:string
    creationDate:Date;
    lastTimeLogged :Date;
    refreshToken: string;
}