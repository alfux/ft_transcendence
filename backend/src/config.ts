import * as dotenv from 'dotenv';

dotenv.config();

export const config_db = {
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER,
  password:process.env.DB_PSWD,
  database:process.env.DB_NAME
}

export const config_42 = {
  key:process.env.API42_CLIENT,
  secret:process.env.API42_SECRET,
  redirect:process.env.API42_REDIRECT,
}

export const config_jwt = {
  secret:process.env.JWT_SECRET
}

export const config_hosts = {
  backend_url:"http://localhost:3001",
  frontend_url:"http://localhost:3000"
}
