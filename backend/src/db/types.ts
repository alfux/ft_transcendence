import { FindOptionsWhere } from "typeorm";

export type FindOptions<T> = FindOptionsWhere<T>
export type FindMultipleOptions<T> = FindOptions<T>|FindOptions<T>[]