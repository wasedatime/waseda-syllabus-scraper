#!/bin/bash

#Show the output of certain commands for debugging
set -x

#Import private deploy key
openssl aes-256-cbc -K $encrypted_9b44a2dce38b_key -iv $encrypted_9b44a2dce38b_iv -in deploy_rsa.enc -out deploy_rsa -d
rm deploy_rsa.enc
chmod 600 deploy_rsa
mv deploy_rsa ~/.ssh/id_rsa