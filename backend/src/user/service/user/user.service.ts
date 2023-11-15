import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from 'src/user/dto/user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserType } from 'src/user/utils/type';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor(@InjectRepository(User) private userRepo :Repository<User>,){
    }

    provideAllUsers(){
        return this.userRepo.find();
    }

    provideUserByEmail(email: string) {
        return this.userRepo.findOne({where:{email}});
    }
    
    //Create New User
    async provideNewUser(profile:any): Promise<User>{
        const user = new User();
        user.firstName = profile.name.givenName;
        user.lastName = profile.name.familyName;
        user.nickName = profile.username;
        user.email = profile.emails[0].value;
        user.avatar = profile.photos[0].value;
        user.creationDate = new Date();
        user.lastTimeLogged = new Date();
        user.refreshToken = 'test'
        this.userRepo.save(user);
        return user
    }

    findByEmail(email:string) : Promise<User | undefined>{
        const user =  this.userRepo.findOne({where:{email}});
        return user?user:undefined;
    }

    provideUserUpdate(){
        return 'update user info'
    }

    provideUserDelete(id :string){
        return this.userRepo.delete(id)
    }

    async userExist(email:string): Promise<boolean>{
        const user = await this.userRepo.findOne({where :{email}});
        return !!user;
    }

    async deleteRefreshToken(id:string){
        const user = await this.userRepo.findOne({where:{id}});
        user.refreshToken = null;
        await this.userRepo.save(user);
    }
}
