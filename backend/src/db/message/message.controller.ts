import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'

import { Message } from "./message.entity";

@Controller('messages')
export class MessageController {

  constructor(@InjectRepository(Message) private readonly messageRepo: Repository<Message>)
  { }

  @Get()
  async find()
  {

    const perPage = 25
    const page = 1
    const skip = (perPage * page) - perPage;

    return await this.messageRepo.findAndCount({
        take: perPage,
        skip,    
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number)
  {
    return await this.messageRepo.findOneOrFail({
        where: {
            id:id
        }
    });
  }

  @Post()
  async create(@Body() body: any)
  {
    if (!body.name || !body.email)
    {
      throw new HttpException('One of `name, email` is missing', HttpStatus.BAD_REQUEST);
    }

    const author = this.messageRepo.create(body);
    this.messageRepo.save(author)

    return author;
  }

//  @Put(':id')
//  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any)
//  {
//    const author = await this.authorRepository.findOneOrFail(id);
//    wrap(author).assign(body);
//    await this.authorRepository.persist(author);

//    return author;
//  }

}