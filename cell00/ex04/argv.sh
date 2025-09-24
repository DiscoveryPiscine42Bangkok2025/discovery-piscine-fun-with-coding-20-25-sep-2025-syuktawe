#!/bin/sh

if [ $# -eq 0 ]; then
    echo "No arguments supplied"
else
    # แสดง arguments แต่ละตัว (ไม่เกิน 3)
    for arg in "$1" "$2" "$3"
    do
        # ถ้า arg ไม่ว่างเปล่า ให้ echo ออกมา
        if [ -n "$arg" ]; then
            echo "$arg"
        fi
    done
fi

