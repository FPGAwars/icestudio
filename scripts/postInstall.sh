#!/bin/bash

sed -i  's/options\.srcDir/\/\/options.srcDir/g' node_modules/grunt-nw-builder/tasks/nw.js
sed -i'' -e 's/options\.srcDir/\/\/options.srcDir/g' node_modules/grunt-nw-builder/tasks/nw.js

