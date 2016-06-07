#!/bin/bash

groups=`azure group list`

azure group list |grep cloud-foundry- | while read line; do 
    #echo $line; 
    rg=`echo $line|cut -d ' ' -f 2`; 
    deployments=`azure group deployment list $rg | tr -d '\n'`; 
    if [ "info:    Executing command group deployment listinfo:    Listing deploymentsinfo:    group deployment list command OK" = "$deployments" ]; then
        echo "$rg empty"
        echo y |azure group delete $rg
    else
        echo "$rg not empty"
    fi
done



