#!/bin/bash

# Show the output of certain commands for debugging
set -x

# convert the shallow clone to regular repo
git fetch --unshallow

# Import private deploy key
openssl aes-256-cbc -K $encrypted_afba565b9640_key -iv $encrypted_afba565b9640_iv -in deploy_rsa.enc -out deploy_rsa -d
rm deploy_rsa.enc
chmod 600 deploy_rsa
mv deploy_rsa ~/.ssh/id_rsa
