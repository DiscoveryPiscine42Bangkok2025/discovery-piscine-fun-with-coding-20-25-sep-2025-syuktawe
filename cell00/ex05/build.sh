#!/bin/bash

# Check if there are no arguments
if [ $# -eq 0 ]; then
    echo "No arguments supplied"
    exit 1
fi

# Loop through all arguments
for arg in "$@"
do
    mkdir "ex$arg"
done
