#!/bin/bash
#############################################
#      Update the translation files         #
#############################################

#-- Update the .po file of all the locale folders
cd app/resources/locale

#-- d is the locale directory
for d in */ ; do

  #-- Get the folder name without the trailing slash
  LOCALE=${d%/}

  echo LOCALE FOLDER: $LOCALE

  #-- Update all the .po files
  msgmerge $LOCALE/$LOCALE.po template.pot -o $LOCALE/$LOCALE.po

done

