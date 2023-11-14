import * as dotenv from 'dotenv';

dotenv.config();

export const config_db = {
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME
}

export const config_42 = {
  key:process.env.API42_KEY,
  secret:process.env.API42_SECRET,
  redirect:process.env.API42_REDIRECT,
}

export const config_jwt = {
  secret:process.env.JWT_SECRET
}
