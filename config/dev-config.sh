#!/bin/bash

input=0
value=
configNames=("FRONTEND_SERVICE" \
             "BACKEND_SERVICE" \
             "POSTGRES_SERVICE" \
             "PG_SERVICE" \
             "PG_ADMIN_EMAIL" \
             "PG_PASSWORD" \
             "FRONT_PORT" \
             "LOCAL_FRONT_PORT"\
             "FRONT_URL" \
             "BACK_PORT" \
             "LOCAL_BACK_PORT" \
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
				"3000:3000"\
                "3000"\
				"localhost"\
				"3001:3001"\
                "3001"\
				"localhost"\
				"postgres_db"\
				"5432:5432"\
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

echo 'Type Enter for default config'
echo 'Type 1 to create full config'
echo 'Type 2 to create dev config'
read -p "Enter your choice: " input

if [[ $input == '' ]]; then
    echo "#Default" > .env
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
        exit
    else
        echo "Type the new value"
        read new_value
        sed -i "s/${configNames[$input]}=.*/${configNames[$input]}=${new_value}/" ".env"
        echo "Replacement done"
    fi
elif [[ $input == '1' ]]; then
    echo "#Default" > .env
    for config in "${configNames[@]}"; do
        read -p "Enter the value for $config: " value
        echo "$config=$value" >> .env
    done
elif [[ $input == '2' ]]; then
    echo "#Dev" > .env
    for ((i=0; i<${#configNames[@]}; i++)); do
        echo "${configNames[i]}=${defaultValues[i]}" >> .env
    done
    echo "Type FrontEnd IP"
    read input
    sed -i "s/FRONT_URL=.*/FRONT_URL=${input}/" ".env"
    echo "Type BackEnd IP"
    read input
    sed -i "s/BACK_URL=.*/BACK_URL=${input}/" ".env"
    echo "Type Ip for 42Redirect <example 127.0.0.1>"
    read input
    echo "Type port for 42Redirect <example 3001>"
    read value
    echo
    sed -i "s|API42_REDIRECT=.*|API42_REDIRECT=http://${input}:${value}/api/auth/login/|g" ".env"


fi
