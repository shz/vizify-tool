#!/bin/sh

root="$(dirname $0)/.."

if [ "$#" -ne 1 ]; then
  echo "Must specify an output directory"
fi

mkdir $1/demo
mkdir $1/demo/vizify
mkdir $1/demo/deps
cp $root/demo_makefile $1/demo/makefile
cp $root/sandbox/demo.cpp $1/demo/main.cpp
cp -r $root/sandbox/deps/* $1/demo/deps
cp -r $root/include $1/demo/vizify
cp -r $root/src $1/demo/vizify
cp -r $root/deps $1/demo/vizify
