#!/bin/sh

#-- Terminal colors
NC="\033[0m"        #-- Reset colors
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"

#-- Start repairing
APPDIR="dist/icestudio/osx64"
if [ -d $APPDIR ]; then
echo "${BLUE}Repairing OSX bundle${NC}"
find "${APPDIR}" -type f -exec file {} \; | grep -E 'Mach-O|dylib' |  cut -d: -f1 |  xargs -I {} chmod +x "{}"

#BASE_DIR=`find ${APPDIR} -d -name "nwjs Framework.framework"`
#ls "$BASE_DIR" | while read f ; do


#	is_link="$BASE_DIR"/"$f"
#	if [ -L "$is_link" ] ; then
#	echo "    Check $is_link"
#		echo "    =>${RED}Deleting $is_link${NC}"
#   	else
#		rm -f "$is_link"

#		echo "    =>${GREEN}Preserving $is_link${NC}"
#	fi
#done

#echo "${BLUE}Repairing OSX bundle${NC}"
#cp -R "$BASE_DIR"/Versions/A/* "$BASE_DIR"/
#rm -rf "$BASE_DIR"/Versions/Current 
#cp -R "$BASE_DIR"/Versions/A "$BASE_DIR"/Versions/Current

echo "    =>${BLUE}OSX bundle ${GREEN}OK${NC}"
else

echo "    =>${RED} OSX bundle not found"
fi
