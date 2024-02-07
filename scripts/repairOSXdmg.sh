#!/bin/sh

#-- Terminal colors
NC="\033[0m"        #-- Reset colors
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"

#-- Start repairing
APPDIR="dist/icestudio/osx64"
if [ -d $APPDIR ]; then
   # Iiterate over .dmg files in dist 
    for dmg in `ls ${APPDIR}/*.dmg`; do
        if [ -f "$dmg" ]; then
            if [ -n "${CODESIGN_ID}" ]; then
                echo "${GREEN}Sign OSX bundle for ${dmg}${NC}"
                codesign --force --deep --sign "${CODESIGN_ID}" "${dmg}"
            fi
        fi
    done
else
    echo "    =>${RED} OSX bundle not found"
fi
