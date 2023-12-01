import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    
    async provideUserById(id: string) {
        const user = await this.userRepo.findOne({where:{id : id}})
        return user;
    }

    async userUpdateTest(user :any, secret:string){
        user.twoFactorAuthSecret = secret
        Object.assign(user)
        return this.userRepo.save(user);
    }

    //Create New User
    async provideNewUser(profile:any): Promise<User>{
        const user = this.userRepo.create({
            id : profile.id,
            firstName : profile.name.givenName,
            lastName : profile.name.familyName,
            nickName : profile.username,
            email : profile.emails[0].value,
            avatar : 'https://cdn.intra.42.fr/users/a5e81b42b8d91e63773eb39dcf618ef6/dpaulino.jpg',
            creationDate : new Date(),
            lastTimeLogged : new Date(),
            refreshToken : 'test',
            twoFactorAuth : false,
            twoFactorAuthSecret : '',
            isAuthenticated : "Unlogged" 
        }
        )
        this.userRepo.save(user);
        return user
    }

    async enableTwoFactorAuth(id: string){
        const user = await this.userRepo.findOne({where :{id}})
        user.twoFactorAuth = true;
        await this.userRepo.save(user);
        
    }

    async disableTwoFactorAuth(id: string){
        const user = await this.userRepo.findOne({where :{id}})
        user.twoFactorAuth = false;
        await this.userRepo.save(user);
        console.log('user: ',user.id)
    }

    async updateLogStatus(id:string, status:string){
        const user = await this.userRepo.findOne({where :{id}})
        if (!user){
            throw new HttpException("User not found",HttpStatus.NOT_FOUND)
        }
        user.isAuthenticated = status;
        await this.userRepo.save(user);
        console.log('user: ',user.id)
    }
    //_________________________________________________

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

    async deleteAll(){
        await this.userRepo.clear();
    }

    async deleteRefreshToken(id:string){
        const user = await this.userRepo.findOne({where:{id}});
        user.refreshToken = null;
        await this.userRepo.save(user);
    }
}
