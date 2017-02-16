#!/bin/sh

NC="\033[0m"
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"

TARGET=~/.local/share/applications/icestudio.desktop
#TARGET=/usr/share/applications/icestudio.desktop

echo "${BLUE}\nThis script installs the 'icestudio.desktop' file"
echo "-------------------------------------------------"

printf "\nEnter the Icestudio path:${NC} "
read SOURCE

if [ ! -f "${SOURCE}/icestudio" ]; then
    echo "${RED}\nError: invalid Icestudio path:${NC} ${SOURCE}"
    exit 1
fi

echo "[Desktop Entry]
Type=Application
Name=Icestudio
Comment=Experimental graphic editor for open FPGAs
StartupNotify=true
Categories=Development;Education;Graphics;" > ${TARGET}

echo "Exec=${SOURCE}/icestudio" >> ${TARGET}
echo "Icon=${SOURCE}/resources/images/icestudio-logo.png" >> ${TARGET}

echo "${GREEN}\nIcestudio.desktop installed!${NC}"
echo "\nPlease, reboot your computer"
