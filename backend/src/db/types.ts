import { FindOptionsSelect, FindOptionsSelectByString, FindOptionsWhere } from "typeorm";

export type FindOptions<T> = FindOptionsWhere<T>
export type SelectOptions<T> = FindOptionsSelect<T> | FindOptionsSelectByString<T>
export type FindMultipleOptions<T> = FindOptions<T> | FindOptions<T>[]