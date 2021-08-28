#!/bin/sh

#-- Terminal colors
NC="\033[0m"
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"
binaryBundleDir="cache/nwjsAarch64"
brandingDir="$binaryBundleDir/nwjs-v0.54.2-linux-arm64"
distBundle="cache/nwjsAarch64/usr/docker/dist/nwjs-chromium-ffmpeg-branding/nwjs-v0.54.2-linux-arm64.tar.gz"
binaryBundleDirDocker="cache/nwjsAarch64/usr"
binaryBundle="cache/nwjsAarch64/nwjs.tar.gz"
icestudioBundle="dist/icestudio/linuxaarch64/"
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

#BASE_DIR=`find dist/icestudio/osx64 -d -name "nwjs Framework.framework"`
#ls "$BASE_DIR" | while read f ; do

#	is_link="$BASE_DIR"/"$f"

#	echo "    Check $is_link"
#	if [ -L "$is_link" ] ; then
#		echo "    =>${RED}Deleting $is_link${NC}"
#		rm -f "$is_link"
#   	else

#		echo "    =>${GREEN}Preserving $is_link${NC}"
#	fi
#done

#echo "${BLUE}Repairing OSX bundle${NC}"
#cp -R "$BASE_DIR"/Versions/A/* "$BASE_DIR"/
#rm -rf "$BASE_DIR"/Versions/Current 
#cp -R "$BASE_DIR"/Versions/A "$BASE_DIR"/Versions/Current

#echo "    =>${BLUE}OSX bundle ${GREEN}OK${NC}"


