#!/bin/bash
set -x

if [ $TRAVIS_BRANCH == 'master' ] ; then
    #Fix HEAD detached
    git checkout master
    git remote add deploy 'deploy@159.89.210.122:waseda-syllabus-scraper.git'
    git add .
    git status
    git commit -m "Deploy from Travis CI"
    git status
    git push deploy master --force
elif [ $TRAVIS_BRANCH == 'staging' ] ; then
    git checkout staging
    git remote add deploy 'deploy@139.59.216.161:waseda-syllabus-scraper.git'
    git add .
    git status
    git commit -m "Deploy from Travis CI"
    git status
    git push deploy staging --force
else
    echo "Not deploying, since this branch isn't master."
fi