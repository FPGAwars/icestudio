#!/usr/bin/env bash

set -e
set -u

FQDN="mch2022.ota.bodge.team"
CERT="ota.pem"
KEY="ota.key.pem"

openssl req -x509 -newkey rsa:4096 -keyout "$KEY" -out "$CERT" -days 36500 -nodes -subj "/CN=$FQDN"
