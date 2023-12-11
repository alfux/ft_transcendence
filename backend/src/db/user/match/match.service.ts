import { Injectable, HttpStatus, HttpException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { Match } from './match.entity'
import { User } from '../user.entity'

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) { }

  async getMatch(where: FindOptionsWhere<Match> = {}, relations = [] as string[]): Promise<Match> {
    const match = await this.matchRepository.findOne({ where: where, relations: relations, })
    if (!match)
      throw new HttpException('Match not found', HttpStatus.BAD_REQUEST)
    return match
  }

  async getMatches(where: FindOptionsWhere<Match> = {}, relations = [] as string[]): Promise<Match[]> {
    const match = await this.matchRepository.find({ where: where, relations: relations, })
    if (!match)
      throw new HttpException('Match not found', HttpStatus.BAD_REQUEST)
    return match
  }

  async createMatch(match: { players: User[], winner: User | null }): Promise<Match> {
    const new_match = this.matchRepository.create(match)
    const rep = await this.matchRepository.save(new_match)
    return rep
  }

}
