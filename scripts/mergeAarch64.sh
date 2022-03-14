#!/bin/sh

#-- Terminal colors
NC="\033[0m"       #-- Reset color
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"


binaryBundleDir="cache/nwjsAarch64"
brandingDir="$binaryBundleDir/nwjs-v0.58.1-linux-arm64"
distBundle="cache/nwjsAarch64/usr/docker/dist/nwjs-chromium-ffmpeg-branding/nwjs-v0.58.1-linux-arm64.tar.gz"
binaryBundleDirDocker="cache/nwjsAarch64/usr"
binaryBundle="cache/nwjsAarch64/nwjs.tar.gz"
icestudioBundle="dist/icestudio/aarch64/"


#-- Start repairing
if [ -d "$binaryBundleDirDocker" ]; then
  echo "${RED}Clean old bundle dir... ${NC}"
  rm -rf "$binaryBundleDirDocker"
fi

echo "${BLUE}Decompress binary bundle${NC}"
tar xzf $binaryBundle -C $binaryBundleDir
echo "${BLUE}Decompress dist bundle${NC}"
tar xzf $distBundle -C $binaryBundleDir

echo "${GREEN}Ready for merge Arm64 bundle${NC}"

 cp -R $brandingDir/* $icestudioBundle/
 mv $icestudioBundle/nw $icestudioBundle/icestudio
 chmod +x $icestudioBundle/icestudio

echo "${GREEN}Arm64 bundle ready${NC}"

