#!/bin/bash

if [ ! -f .env ]
then
  export $(cat .env | xargs)
fi

while IFS= read -r line; do
    while [[ $line =~ (\$\{([^}]+)\}) ]]; do
        var_match=${BASH_REMATCH[1]}
        command_to_run=${BASH_REMATCH[2]}
        var_value=$(eval "$command_to_run")
        line=${line//$var_match/$var_value}
    done
    echo "$line"
done < $1

while [[ $line =~ (\$\{([^}]+)\}) ]]; do
    var_match=${BASH_REMATCH[1]}
    command_to_run=${BASH_REMATCH[2]}
    var_value=$(eval "$command_to_run")
    line=${line//$var_match/$var_value}
done
if [ -n "$line" ]; then
    echo "$line"
fi