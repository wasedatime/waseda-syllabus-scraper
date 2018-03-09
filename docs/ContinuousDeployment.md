####Server side

Add a deploy user and with limited directory access permission.

```
adduser deploy
# TODO think about what restriction to impose after success
chown -R deploy:deploy /var/www/wasetime-web
```

```
mkdir ~/waseda-syllabus-scraper.git
cd ~/waseda-syllabus-scraper.git
git init --bare
vim hooks/post-receive
```

```bash
#!/bin/bash
while read oldrev newrev ref
do
    if [[ $ref =~ .*/master$ ]];
    then
        echo "Master ref received.  Deploying master branch to production..."
        git --work-tree=/home/deploy/waseda-syllabus-scraper --git-dir=/home/deploy/waseda-syllabus-scraper.git checkout -f
        echo "Deployed to master branch. Changing directory to work-tree"
        cd /home/deploy/waseda-syllabus-scraper
        echo "Done. Activating python virtual environment..."
        source /home/deploy/deploy-virtual-env/bin/activate \
        && echo "Done. Installing dev dependencies..." \
        && pip3 install -r requirements-dev.txt \
        && echo "Done. Deactivating virtual environment..." \
        && deactivate \
        && echo "Done. waseda-syllabus-scraper is updated successfully."
    else
        echo "Ref $ref successfully received.  Doing nothing: only the master branch may be deployed on this server."
    fi
done
```

Make post-receive executable for user deploy exclusively.

```
chmod u+x hooks/post-receive
```


#chron job


####Local side

This example assumes you are running the command in your project directory. 
If not, add -r owner/project
```
gem install travis
travis login
cd my_project
travis encrypt-file ~/.ssh/deploy_rsa --add
```
