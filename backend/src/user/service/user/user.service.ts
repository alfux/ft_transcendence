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

    provideUserById(id: string) {
        //return this.userRepo.findOne(id);
        return
    }
    

    async provideNewUser(user:{ firstName: string; email: string }): Promise<User>{
        const newUser = this.userRepo.create({...user,lastTimeLogged: new Date()})
        console.log("created");
        return this.userRepo.save(newUser)
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
        //return user if true else false
        return !!user;
    }
}
