#!/bin/bash

SIZES=( "16x16" "32x32" "64x64" "128x128" "256x256"  )

for SIZE in "${SIZES[@]}"
do
    echo "Create $SIZE icons"
    mkdir -p $SIZE/apps
    mkdir -p $SIZE/mimetypes
    convert icon.png -resize $SIZE $SIZE/apps/icon.png
    cp $SIZE/apps/icon.png $SIZE/mimetypes/icon.png
done

echo "Done!"
