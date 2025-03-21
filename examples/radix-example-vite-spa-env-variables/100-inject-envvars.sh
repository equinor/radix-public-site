#!/usr/bin/env sh
#

envFile=$(ls -t /usr/share/nginx/html/assets/environmentVariables*.js | head -n1)
envsubst < "$envFile" > /tmp/envFile
cp /tmp/envFile "$envFile"
rm /tmp/envFile
