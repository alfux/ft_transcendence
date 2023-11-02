import { IsEmail, IsNotEmpty } from "class-validator";

export class UserDto{
    id: number;
    //@IsNotEmpty()
    firstName: string;
    //@IsNotEmpty()
    lastName: string;
    //@IsEmail()
    nickName: string;
    //avatar
    email:string;
    lastTimeLogged :Date;
}