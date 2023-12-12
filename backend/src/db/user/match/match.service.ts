import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { User } from '../user.entity'

import { Match } from '.'
import { HttpNotFound } from 'src/exceptions'
import { FindOptions, FindMultipleOptions } from 'src/db/types'

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) { }

  async getMatch(where: FindOptions<Match> = {}, relations = [] as string[]): Promise<Match> {
    const match = await this.matchRepository.findOne({ where: where, relations: relations, })
    if (!match)
      throw new HttpNotFound("Match")
    return match
  }

  async getMatches(where: FindMultipleOptions<Match>|FindOptionsWhere<Match>[] = {}, relations = [] as string[]): Promise<Match[]> {
    const match = await this.matchRepository.find({ where: where, relations: relations, })
    if (!match)
      throw new HttpNotFound("Match")
    return match
  }

  async createMatch(match: { players: User[], winner: User | null }): Promise<Match> {
    const new_match = this.matchRepository.create(match)
    const rep = await this.matchRepository.save(new_match)
    return rep
  }

}
