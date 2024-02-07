#!/bin/sh

#-- Terminal colors
NC="\033[0m"        #-- Reset colors
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"

#-- Start repairing
APPDIR="dist/icestudio/osxarm64"
if [ -d $APPDIR ]; then

    echo "${BLUE}Repairing OSX bundle${NC}"
    find "${APPDIR}" -type f -exec file {} \; | grep -E 'Mach-O|dylib' |  cut -d: -f1 |  xargs -I {} chmod +x "{}"

    if [ -n "${CODESIGN_ID}" ]; then
        echo "${BLUE} Sign OSX bundle${NC}"
        codesign --force --deep --sign "${CODESIGN_ID}" "${APPDIR}/icestudio.app"
    fi
    echo "    =>${BLUE}OSX bundle ${GREEN}OK${NC}"
else
    echo "    =>${RED} OSX ARM64 bundle not found"
fi
