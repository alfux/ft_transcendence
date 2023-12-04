import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { use } from 'passport';
import { UserDto } from 'src/user/dto/user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserType } from 'src/user/utils/type';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor(@InjectRepository(User) private userRepo :Repository<User>,){
    }
    //provide all users
    provideAllUsers(){
        return this.userRepo.find();
    }
    //provide a user by email
    async provideUserByEmail(email: string):Promise<User> {
        const user = await this.userRepo.findOne({where:{email : email}});
        return user;
    }
    //provide a user by id
    async provideUserById(id: string) :Promise<User>{
        const user = await this.userRepo.findOne({where:{id : id}})
        return user;
    }
    //Update 2fa secret
    async userUpdateTwoFactorSecret(user :User, secret:string){
        user.twoFactorAuthSecret = secret
        Object.assign(user)
        return await this.userRepo.save(user);
    }

    //Create New User
    async provideNewUser(profile:any): Promise<User>{
        const user = this.userRepo.create({
            id : profile.id,
            firstName : profile.name.givenName,
            lastName : profile.name.familyName,
            nickName : profile.username,
            email : profile.emails[0].value,
            avatar : profile._json.image.link,
            creationDate : new Date(),
            lastTimeLogged : new Date(),
            refreshToken : '',
            twoFactorAuth : false,
            twoFactorAuthSecret : '',
            isAuthenticated : "Unlogged" 
        }
        )
        await this.userRepo.save(user);
        return user
    }
    //enable 2fa
    async enableTwoFactorAuth(id: string){
        const user = await this.userRepo.findOne({where :{id}})
        user.twoFactorAuth = true;
        await this.userRepo.save(user);
        
    }
    //disable 2fa
    async disableTwoFactorAuth(id: string){
        const user = await this.userRepo.findOne({where :{id}})
        user.twoFactorAuth = false;
        await this.userRepo.save(user);
        console.log('user: ',user.id)
    }
    //update login status
    async updateLogStatus(id:string, status:string){
        const user = await this.userRepo.findOne({where :{id}})
        if (!user){
            throw new HttpException("User not found",HttpStatus.NOT_FOUND)
        }
        user.isAuthenticated = status;
        await this.userRepo.save(user);
    }

    //update refresh token if null it empty
    async updateRefreshToken(id:string, refreshToken:string | null){
        const user = await this.userRepo.findOne({where :{id}})
        if (!user){
            throw new HttpException("User not found",HttpStatus.NOT_FOUND)
        }
 
        refreshToken?user.refreshToken = refreshToken:user.refreshToken = '';
        await this.userRepo.save(user);
        console.log('user refresh token updated ',user)
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
