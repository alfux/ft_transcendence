MYSQL_DATABASE=ft_transcendence
MYSQL_ROOT_PASSWORD=root
MYSQL_USER=backend
MYSQL_PASSWORD=backend

sudo apt-get update
sudo apt-get install -y mariadb-server mariadb-client

echo "mysql install db"
sudo mariadb-install-db

sudo chown -R mysql /var/lib/mysql
sudo chgrp -R mysql /var/lib/mysql
sudo chmod 755 /var/lib/mysql

sudo systemctl start mariadb
sudo service mysqld start

#Check if the database exists

if [ -d "/var/lib/mysql/$MYSQL_DATABASE" ]
then 

	echo "Database already exists"
else


ROOTPASS="root"

config=".my.cnf.$$"
command=".mysql.$$"
output=".my.output.$$"

mysql_command="/usr/bin/mariadb"
trap "interrupt" 1 2 3 6 15
prepare() {
    touch $config $command
    chmod 600 $config $command
}
do_query() {
    echo "$1" >$command
    $mysql_command --defaults-file=$config $args <$command >$output
    return $?
}
basic_single_escape () {
    echo "$1" | sed 's/\(['"'"'\]\)/\\\1/g'
}
make_config() {
    echo "# mysql_secure_installation config file" >$config
    echo "[mysql]" >>$config
    echo "user=root" >>$config
    esc_pass=`basic_single_escape "$ROOTPASS"`
    echo "password='$esc_pass'" >>$config
    #sed 's,^,> ,' < $config  # Debugging
}

get_root_password() {
	make_config
	do_query "show create user root@localhost"
    if grep -q unix_socket $output; then
      emptypass=0
    fi
}

set_root_password() {
    esc_pass=`basic_single_escape "$ROOTPASS"`
    do_query "UPDATE mysql.global_priv SET priv=json_set(priv, '$.plugin', 'mysql_native_password', '$.authentication_string', PASSWORD('$esc_pass')) WHERE User='root';"
    if [ $? -eq 0 ]; then
	echo "Password updated successfully!"
	echo "Reloading privilege tables.."
	reload_privilege_tables
	if [ $? -eq 1 ]; then
		clean_and_exit
	fi
	echo
	make_config
    else
	echo "Password update failed!"
	clean_and_exit
    fi

    return 0
}

remove_anonymous_users() {
    do_query "DELETE FROM mysql.global_priv WHERE User='';"
    if [ $? -eq 0 ]; then
	echo " ... Success!"
    else
	echo " ... Failed!"
	clean_and_exit
    fi
    return 0
}

remove_remote_root() {
    do_query "DELETE FROM mysql.global_priv WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
    if [ $? -eq 0 ]; then
	echo " ... Success!"
    else
	echo " ... Failed!"
    fi
}

remove_test_database() {
    echo " - Dropping test database..."
    do_query "DROP DATABASE IF EXISTS test;"
    if [ $? -eq 0 ]; then
	echo " ... Success!"
    else
	echo " ... Failed!  Not critical, keep moving..."
    fi

    echo " - Removing privileges on test database..."
    do_query "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%'"
    if [ $? -eq 0 ]; then
	echo " ... Success!"
    else
	echo " ... Failed!  Not critical, keep moving..."
    fi

    return 0
}

reload_privilege_tables() {
    do_query "FLUSH PRIVILEGES;"
    if [ $? -eq 0 ]; then
	echo " ... Success!"
	return 0
    else
	echo " ... Failed!"
	return 1
    fi
}
interrupt() {
    echo
    echo "Aborting!"
    echo
    cleanup
    stty echo
    exit 1
}
cleanup() {
    echo "Cleaning up..."
    rm -f $config $command $output
}
clean_and_exit() {
	cleanup
	exit 1
}

prepare
get_root_password

#
# Set the root password
#
do_query "UPDATE mysql.global_priv SET priv=json_set(priv, '$.password_last_changed', UNIX_TIMESTAMP(), '$.plugin', 'mysql_native_password', '$.authentication_string', 'invalid', '$.auth_or', json_array(json_object(), json_object('plugin', 'unix_socket'))) WHERE User='root';"
if [ $? -eq 0 ]; then
 echo "Enabled successfully!"
 echo "Reloading privilege tables.."
 reload_privilege_tables
 if [ $? -eq 1 ]; then
   clean_and_exit
 fi
 echo
else
 echo "Failed!"
 clean_and_exit
fi

echo "Setting root password"
set_root_password

#
# Remove anonymous users
#
echo "Removing anonymous users"
remove_anonymous_users

#
# Disallow remote root login
#
echo "Disallow remote root login"
remove_remote_root

#
# Remove test database
#
echo "Removing test database"
remove_test_database

#
# Reload privilege tables
#
echo "Reloading the privilege tables"
reload_privilege_tables

cleanup


#Add a root user on 127.0.0.1 to allow remote connexion 
#Flush privileges allow to your sql tables to be updated automatically when you modify it
#mysql -uroot launch mysql command line client
echo "GRANT ALL ON *.* TO 'root'@'%' IDENTIFIED BY '$MYSQL_ROOT_PASSWORD'; FLUSH PRIVILEGES;" | mysql -uroot

#Create database and user in the database for wordpress

echo "CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE; GRANT ALL ON $MYSQL_DATABASE.* TO '$c'@'%' IDENTIFIED BY '$MYSQL_PASSWORD'; FLUSH PRIVILEGES;" | mysql -u root

fi
