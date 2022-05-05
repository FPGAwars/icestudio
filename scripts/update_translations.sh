#!/bin/bash
#############################################
#      Update the translation files         #
#############################################

#-- File for the Statistics
STATS_FILE="statistics.txt"

#-- Update the .po file of all the locale folders
cd app/resources/locale

#-- Create a blank file
echo "" > $STATS_FILE

#-- d is the locale directory
for d in */ ; do

  #-- Get the folder name without the trailing slash
  LOCALE=${d%/}

  echo LOCALE FOLDER: $LOCALE

  #-- Update all the .po files
  msgmerge $LOCALE/$LOCALE.po template.pot -o $LOCALE/$LOCALE.po

  #-- Add the statistics
  echo $LOCALE >> $STATS_FILE
  msgfmt --statistics $LOCALE/$LOCALE.po 2>> $STATS_FILE
  echo "" >> $STATS_FILE


done

