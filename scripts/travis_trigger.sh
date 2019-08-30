#!/bin/sh

echo "> travis login"
travis login --org

echo "> travis token"
travis token --org

echo "> Enter the token: "
read TOKEN

echo "> Enter the tag: "
read TAG

body="{
  \"request\": {
    \"branch\": \"$TAG\"
  }
}"

echo "> Trigger travis build: "
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Travis-API-Version: 3" \
  -H "Authorization: token $TOKEN" \
  -d "$body" \
  https://api.travis-ci.org/repo/FPGAwars%2Ficestudio/requests

echo "> Done!"
