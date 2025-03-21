#!/usr/bin/env sh
#

set -ex

envFile=$(ls -t /usr/share/nginx/html/assets/environmentVariables*.js | head -n1)
cat $envFile
envsubst < "$envFile" > /tmp/envFile
cp /tmp/envFile "$envFile"
rm /tmp/envFile
