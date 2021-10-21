#! /bin/bash
cBlue='\033[01;34m'
cNone='\033[00m'
echo "${cBlue}Start Firebase, Import Data and Export Data 🔥 ${cNone}"
cd ../app
firebase emulators:start --export-on-exit=../testdata --import=../testdata