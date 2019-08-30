#!/bin/sh

NC="\033[0m"
BLUE="\033[1;34m"
RED="\033[1;31m"
GREEN="\033[1;32m"

APP_DIR=~/.local/share/applications
APP=${APP_DIR}/icestudio.desktop

MIME_DIR=~/.local/share/mime
MIME_PKG=${MIME_DIR}/packages
MIME=${MIME_PKG}/icestudio.xml

ICON_DIR=~/.local/share/icons
ICON=${ICON_DIR}/application-x-icestudio-project.png

echo "${BLUE}This script installs Icestudio as a user application"
echo "----------------------------------------------------"

printf "Enter the Icestudio path:${NC} "
read SOURCE

if [ ! -f "${SOURCE}/icestudio" ]; then
    echo "${RED}\nError: invalid Icestudio path${NC}"
    exit 1
fi

cd ${SOURCE}
PWD=`pwd`


# Desktop Entry

mkdir -p ${APP_DIR}

echo "[Desktop Entry]
Name=Icestudio
Comment=Visual editor for open FPGA boards
Comment[es]=Editor visual para placas FPGA libres
Type=Application
Categories=Development;Education;Graphics;
StartupNotify=true
MimeType=application/x-icestudio-project;
" > ${APP}

echo "Exec=${PWD}/icestudio %f" >> ${APP}
echo "Icon=${ICON}" >> ${APP}

mkdir -p ${ICON_DIR}
cp "${PWD}/resources/images/icestudio-logo.png" ${ICON}

update-desktop-database ${APP_DIR}

echo "${GREEN}\nIcestudio.desktop installed!${NC}"


# Register extension .ice

mkdir -p ${MIME_PKG}

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<mime-info xmlns=\"http://www.freedesktop.org/standards/shared-mime-info\">
  <mime-type type=\"application/x-icestudio-project\">
    <sub-class-of type=\"application/json\"/>
    <comment>Icestudio project</comment>
    <glob pattern=\"*.ice\"/>
    <icon name=\"application-x-icestudio-project\"/>
  </mime-type>
</mime-info>" > ${MIME}

update-mime-database ${MIME_DIR}

echo "${GREEN}Icestudio project registered!${NC}"
