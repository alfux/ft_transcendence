#!/bin/bash
input=
echo 'Type 0 for default conf'
echo 'Type 1 to create conf'
read $input
if [[ $input -eq '0' ]]; then
	echo hello
else
	echo world
fi