#!/bin/sh

#-- Terminal colors
NC="\033[0m"        #-- Reset colors
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"

DISTDIR="dist"
LINUXAPP="${DISTDIR}/icestudio/linux64"
APPIMAGE_SKEL="icestudio.AppDir"
APPIMAGE_SKEL_DIR="res/AppImage/${APPIMAGE_SKEL}"
BUILDDIR="${DISTDIR}/icestudio.AppDir"
APPIMAGETOOL="appimagetool-x86_64.AppImage"
APPIMAGE_O="Icestudio-x86_64.AppImage"
APPIMAGE="icestudio-${ICESTUDIO_BUILD_ID}-linux64.AppImage"

if [ -n "${BUILDDIR}" ]; then
	echo "${BLUE}Clean previous build ${NC}"
	rm -rf ${BUILDDIR}
	sync
fi


if [ -d $LINUXAPP ]; then
	if [ -d $APPIMAGE_SKEL_DIR ]; then
		if [ -n "${ICESTUDIO_BUILD_ID}" ]; then
			echo "${BLUE}Populating appimage skeleton${NC}"
			rsync -aH ${APPIMAGE_SKEL_DIR} ${DISTDIR}
			if [ -n "${BUILDDIR}" ]; then

				rsync -aH  "${LINUXAPP}"/* "${BUILDDIR}"/usr/bin/
				perl -pi -e  's/\{\{icestudioBuildId\}\}/$ENV{"ICESTUDIO_BUILD_ID"}/g' "${BUILDDIR}"/Icestudio.desktop
				cd $DISTDIR
		
				echo "${BLUE}Downloading appimage tool${NC}"
				wget "https://github.com/AppImage/AppImageKit/releases/download/continuous/${APPIMAGETOOL}"
				if [ -n "${APPIMAGETOOL}" ]; then
					chmod +x $APPIMAGETOOL
					ARCH=x86_64 ./${APPIMAGETOOL} ${APPIMAGE_SKEL}
					if [ -n "${APPIMAGE_O}" ]; then
						echo "    =>${BLUE}VERSIONING APPIMAGE${NC}"
						mv ${APPIMAGE_O} ${APPIMAGE}

						echo "    =>${BLUE}CLEAN APPIMAGE ARTIFACTS${NC}"
						rm -rf ${APPIMAGE_SKEL}
						rm -f ${APPIMAGETOOL}

						echo "    =>${BLUE}APPIMAGE LINUX64 bundle ${GREEN}OK${NC}"
					else
						echo "    =>${RED} APPIMAGE NOT GENERATED CORRECTLY"
					fi
				else
					echo "    =>${RED} APPIMAGETOOL not found"
				fi
			else
				echo "    =>${RED} APPIMAGE sleketon not populated"
			fi
		else
			echo "    =>${RED} BUILD ID NOT PRESENT (set env var ICESTUDIO_BUILD_ID)"
		fi
	else
		echo "    =>${RED} APPIMAGE skeleton not found"
	fi
else
	echo "    =>${RED} LINUX64 bundle not found"
fi
