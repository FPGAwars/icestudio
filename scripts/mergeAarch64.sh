#!/bin/sh

#-- Terminal colors
NC="\033[0m"       #-- Reset color
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"


#-- Folder where the final NW binary files should be copied
DESTINATION="dist/icestudio/aarch64"

#-- The icestudio executable file is called nw
#-- rename it to icestudio
mv $DESTINATION/nw $DESTINATION/icestudio

#-- Give execution permission to icestudio file
chmod +x $DESTINATION/icestudio

echo "${GREEN}NW for Arm64 ready${NC}"

