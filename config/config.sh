#!/bin/bash

input=0
value=
configNames=("FRONTEND_SERVICE" \
             "BACKEND_SERVICE" \
             "POSTGRES_SERVICE" \
             "PG_SERVICE" \
             "PG_ADMIN_EMAIL" \
             "PG_PASSWORD" \
             "FRONT_PORT_IN" \
             "FRONT_PORT" \
             "FRONT_URL" \
             "BACK_PORT_IN" \
             "BACK_PORT" \
             "BACK_URL" \
             "DB_HOST" \
             "DB_PORT" \
             "DB_USER" \
             "DB_PSWD" \
             "DB_NAME" \
             "API42_CLIENT" \
             "API42_SECRET" \
             "API42_REDIRECT" \
             "JWT_SECRET_TOKEN" \
             "JWT_SECRET_REFRESH" \
             "JWT_EXPIRE_TOKEN" \
             "JWT_EXPIRE_REFRESH")

defaultValues=("frontend"\
				"backend"\
				"postgres_db"\
				"pga"\
				"admin@42.com"\
				"pgadmin"\
				"3000"\
				"3000"
				"localhost"\
				"3001"\
				"3001"\
				"localhost"\
				"postgres_db"\
				"5432"\
				"admin"\
				"admin"\
				"ft_transcendence"\
				"u-s4t2ud-d53a89b2df6fafe9be34fbf1bb942fa24a9a1f3afc8ab859f9c4855551ec68c6"\
				"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"\
				"http://localhost:3001/api/auth/login"\
				"dzqinijeuhgriejiakdizajf"\
				"fnuribfhrnj,ezibglspẑs"\
				"15m"\
				"7d"\
				)
#!/bin/bash

configNames=("FRONTEND_SERVICE" "BACKEND_SERVICE" "POSTGRES_SERVICE" "PG_SERVICE" "PG_ADMIN_EMAIL" "PG_PASSWORD" "FRONT_PORT_IN" "FRONT_PORT" "FRONT_URL" "BACK_PORT_IN" "BACK_PORT" "BACK_URL" "DB_HOST" "DB_PORT" "DB_USER" "DB_PSWD" "DB_NAME" "API42_CLIENT" "API42_SECRET" "API42_REDIRECT" "JWT_SECRET_TOKEN" "JWT_SECRET_REFRESH" "JWT_EXPIRE_TOKEN" "JWT_EXPIRE_REFRESH")
defaultValues=("default_frontend" "default_backend" "default_postgres" "default_pg" "default_email" "default_password" "default_front_in" "default_front_port" "default_front_url" "default_back_in" "default_back_port" "default_back_url" "default_db_host" "default_db_port" "default_db_user" "default_db_password" "default_db_name" "default_api_client" "default_api_secret" "default_api_redirect" "default_jwt_secret_token" "default_jwt_secret_refresh" "default_jwt_expire_token" "default_jwt_expire_refresh")

echo 'Type Enter for default conf'
echo 'Type 1 to create conf'
read -p "Enter your choice: " input

if [[ $input == '' ]]; then
    for ((i=0; i<${#configNames[@]}; i++)); do
        echo "${configNames[i]}=${defaultValues[i]}" >> .env
    done

    value=0
    for ((i=0; i<${#configNames[@]}; i++, value++)); do
        echo "$value : ${configNames[i]}=${defaultValues[i]}"
    done

    echo "If you want to change a value, type the corresponding number; otherwise, press Enter"
    read input

    if [[ $input == '' ]]; then
		mv .env ../
		cp ../.env ../backend
        exit
    else
        echo "Type the new value"
        read new_value

        # Use sed to perform the replacement
        sed -i "s/${configNames[$input]}=.*/${configNames[$input]}=${new_value}/" ".env"
        echo "Replacement done"
    fi
else
    for config in "${configNames[@]}"; do
        read -p "Enter the value for $config: " value
        echo "$config=$value" >> test.txt
    done
fi


# #Nom des services
# FRONTEND_SERVICE=frontend
# BACKEND_SERVICE=backend
# POSTGRES_SERVICE=postgres_db

# PG_SERVICE=pga
# PG_ADMIN_EMAIL=admin@42.com
# PG_PASSWORD=pgadmin

# # *_IN = le port utilisé coté container
# FRONT_PORT_IN=3000
# FRONT_PORT=3000
# FRONT_URL=localhost

# BACK_PORT_IN=3001
# BACK_PORT=3001
# BACK_URL=localhost
# #BACK_URL=backend

# DB_HOST=localhost
# #DB_HOST=postgres_db
# DB_PORT=5432
# DB_USER=admin
# DB_PSWD=admin
# DB_NAME=ft_transcendence

# API42_CLIENT=u-s4t2ud-d53a89b2df6fafe9be34fbf1bb942fa24a9a1f3afc8ab859f9c4855551ec68c6
# API42_SECRET=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
# API42_REDIRECT=http://localhost:3001/api/auth/login


# JWT_SECRET_TOKEN=dzqinijeuhgriejiakdizajf
# JWT_SECRET_REFRESH=fnuribfhrnj,ezibglspẑs
# JWT_EXPIRE_TOKEN=15m
# JWT_EXPIRE_REFRESH=7d