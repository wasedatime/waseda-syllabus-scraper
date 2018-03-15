## Server side

### Add user deploy

Add a deploy user and with limited directory access permission.

```bash
adduser deploy
# TODO think about what restriction to impose after success
chown -R deploy:deploy /some/directory
```

```bash
mkdir ~/waseda-syllabus-scraper.git
cd ~/waseda-syllabus-scraper.git
git init --bare
vim hooks/post-receive
```
### In post-receive

Write the script to be executed after receiving master reference

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
        && echo "Done. Making shell scripts executable by user deploy..." \
        && chmod u+x /home/deploy/waseda-syllabus-scraper/server/scrape.sh \
        && chmod u+x /home/deploy/waseda-syllabus-scraper/server/aggregate.sh \
        && chmod u+x /home/deploy/waseda-syllabus-scraper/server/export_dev.sh \
        && echo "Done. waseda-syllabus-scraper is updated successfully."
    else
        echo "Ref $ref successfully received.  Doing nothing: only the master branch may be deployed on this server."
    fi
done
```

**IMPORTANT** Make post-receive executable for user deploy exclusively, or else it won't be executed.

```bash
chmod u+x hooks/post-receive
```

### Local side

Create and encrypt private key deploy_rsa to the project

```bash
gem install travis
travis login
cd my_project
# This example assumes you are running the command in your project directory. 
# If not, add -r owner/project
travis encrypt-file ~/.ssh/deploy_rsa --add
```

### Travis side

Refer to 
[.travis.yml](../.travis.yml), 
[before_install.sh](../travis/before_install.sh) and
[deploy.sh](../travis/deploy.sh) 
for the procedure details.
