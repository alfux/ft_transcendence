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
  secret_token:process.env.JWT_SECRET_TOKEN,
  expires_token:process.env.JWT_EXPIRE_TOKEN,
  secret_refresh:process.env.JWT_SECRET_REFRESH,
  expires_refresh:process.env.JWT_EXPIRE_REFRESH,
}

export const config_hosts = {

  frontend_port:"3000",
  frontend_url:"localhost",
  backend_url:"http://localhost:3001",
}
