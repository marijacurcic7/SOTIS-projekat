#! /bin/bash
cBlue='\033[01;34m'
cNone='\033[00m'
echo "${cBlue}Compile & Watch Functions ${cNone}"
cd ../app/functions && npx tsc -w