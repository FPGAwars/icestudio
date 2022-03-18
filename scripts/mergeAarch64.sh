#!/bin/sh

#-- Terminal colors
NC="\033[0m"       #-- Reset color
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"

#-- The NWjs binary for ARM is a tarball (tar.gz) that should be 
#-- uncompressed and copied to the icestudio/aarch64 (DESTINATION) folder

NW_NAME=nwjs-v0.58.1-linux-arm64  # <-- CHANGE THIS if NW is UPGRADED! <----
NW_NAME_TAR_GZ="$NW_NAME.tar.gz"

#-- Folder where to uncompress the NW dist tarball
DIST_TMP="dist/tmp/nwjsAarch64"

#-- Create the folder, if it does not exist
mkdir -p $DIST_TMP

#-- Folder where the final NW binary files should be copied
DESTINATION="dist/icestudio/aarch64"

#---- The NW tarball is located inside another tar.gz file, that has been
#---- downloaded by the grunt wget:nwjsAarch64 task to the cache folder

#-- Cache folder:
NW_CACHE="cache/nwjsAarch64"

#-- NW dist tarball
NW_DIST_TAR_GZ="$NW_CACHE/nwjs.tar.gz"

#-- The NW tarball is locate in the following path, once the
#-- DIST tarball is unzipped
NW_PATH="$DIST_TMP/usr/docker/dist/nwjs-chromium-ffmpeg-branding"  

#-- Src folder where the NW files have been unzipped
NW_SRC_PATH="$DIST_TMP/$NW_NAME"

#-- NW tarball with path
NW_TARBALL="$NW_PATH/$NW_NAME_TAR_GZ"



#-- Unzip the NW Dist Tarball into the cache folder
echo "${BLUE}Unzipping the NW Dist tarball: ${NW_DIST_TAR_GZ}${NC}"
tar xzf $NW_DIST_TAR_GZ -C $DIST_TMP

#-- Unzip the NW tarball into the cache folder
echo "${BLUE}unzipping the NW tarball: $NW_NAME_TAR_GZ${NC}"
tar xzf "$NW_TARBALL" -C $DIST_TMP

#-- Copy the NW files to the DESTINATION folder

echo "${GREEN}Copying NW files...${NC}"
echo "From: $NW_SRC_PATH/*"
echo "To: $DESTINATION/"
cp -R $NW_SRC_PATH/* $DESTINATION/

#-- The icestudio executable file is called nw
#-- rename it to icestudio
mv $DESTINATION/nw $DESTINATION/icestudio

#-- Give execution permission to icestudio file
chmod +x $DESTINATION/icestudio

echo "${GREEN}NW for Arm64 ready${NC}"

