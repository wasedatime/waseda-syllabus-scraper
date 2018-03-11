#!/bin/bash

# delete previous previous syllabus data
rm -R /home/deploy/syllabus_prev

# backup previous syllabus data
mv /home/deploy/syllabus /home/deploy/syllabus_prev

# dump database syllabus
mongodump -d syllabus -o /home/deploy/syllabus

# cd into dumped syllabus directory
cd /home/deploy/syllabus

# for every *.bson collection, export it to  remote mlab waseda-syllabus-dev database
for file in *.bson ;
    # -f flag returns true if file exists and is a regular file. If not skip the iteration
    do
        [[ -f "$file" ]] || continue
        # format: mongorestore -h <host_port> -d waseda-syllabus-dev -u <user> -p <password> <input .bson file>
        mongorestore -h "$MLAB_HOST_PORT" -d waseda-syllabus-dev  \
            -u deploy -p "$MLAB_PASSWORD" "$file" ;
done


# for all json export to remote mongodb, check how to access scrapy dumped status
# https://stackoverflow.com/questions/31210345/cant-access-the-scrapy-stats-that-are-dumped-on-finish-eg-finish-time