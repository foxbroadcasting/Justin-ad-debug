#Justin-ad-debug

Usage: 
This script makes a call to Verizon's ad debug tool and logs all requests and responses to splunk. Only using the Low Latency test streams at the moment. Will need to update the config if we decide to expand

# Cron job
This scripts runs as a cron job on Jenkins.
https://jenkins.admin.foxdcg.com/job/dcg-video-ad-debug/

It runs at 3 am and 3 pm every day.
If you need to run it manually open the job in Jenkins and click "Build now"

# Running locally
Inside docker
```sh
docker build -t dcg-video-ad-debug .
docker run dcg-video-ad-debug
```
Or you can run it directly
```sh
npm install
node index.js
```

# Deploying an update

Build an image and push to ECR, increment the version: v1, v2, v3 etc

```sh
$(aws ecr get-login --no-include-email --region us-west-2)

docker build -t dcg-video-ad-debug .
docker tag dcg-video-ad-debug:latest 987655465633.dkr.ecr.us-west-2.amazonaws.com/dcg-video-ad-debug:v1
docker push 987655465633.dkr.ecr.us-west-2.amazonaws.com/dcg-video-ad-debug:v1
```

Change image version in Jenkins
https://jenkins.admin.foxdcg.com/job/dcg-video-ad-debug/configure