#!/bin/bash          

echo updating landscapes.io 
cd ./landscapes.io

echo "git pull"
DATE=`date +%Y-%m-%d@%R:%S`
GP=`git pull | tee ../output-$DATE.txt`

if [ "$GP" == "xAlready up-to-date." ]
then
  echo $GP
else
  echo "npm run build"
#  npm run build >> ../output-$DATE.txt
  echo "systemctl restart landscapes"
  systemctl stop landscapes
  systemctl start landscapes
fi
