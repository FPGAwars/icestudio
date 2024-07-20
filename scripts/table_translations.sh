#!/usr/bin/env bash
#############################################
#   Generate README translation %'s table   #
#############################################

#-- File for the Statistics
TABLE_FILE="readme_table.txt"

#-- lookup table
declare "languages_en=English"
declare "languages_es_ES=Spanish"
declare "languages_ja_JP=Japanese"
declare "languages_fr_FR=French"
declare "languages_it_IT=Italian"
declare "languages_zh_TW=Taiwanese"
declare "languages_zh_CN=Chinese"
declare "languages_eu_ES=Basque"
declare "languages_de_DE=German"
declare "languages_ko_KR=Korean"
declare "languages_cs_CZ=Czech"
declare "languages_tr_TR=Turkish"
declare "languages_uk_UA=Ukrainian"
declare "languages_ru_RU=Russian"
declare "languages_ca_ES=Catalonian"
declare "languages_el_GR=Greek"
declare "languages_nl_NL=Dutch"
declare "languages_gl_ES=Galician"


#-- Examine the .po file of all the locale folders
cd app/resources/locale


#-- Calculate results: percentage per LOCALE

TOTAL_LINES=$(msgfmt --statistics template.pot 2>&1 |cut -d " " -f 4)
RESULTS=()

#-- d is the locale directory
for d in */ ; do
    LOCALE=${d%/}  # folder without trailing slash
    TRANSLATED_LINES=$(msgfmt --statistics $LOCALE/$LOCALE.po 2>&1 |cut -d " " -f 1)
    PERCENT=$((TRANSLATED_LINES * 100 / TOTAL_LINES))
    RESULTS[${#RESULTS[@]}]="$PERCENT:$LOCALE" # add to the end of the array
done

#-- sort the results
IFS=$'\n'; SORTED=($(sort -nr <<<"${RESULTS[*]}")); unset IFS


#-- Output results
echo "|  Language  | Translated strings |" > $TABLE_FILE
echo "|:----------:|:------------------:|" >> $TABLE_FILE

for LINE in ${SORTED[*]}
do
    PARTS=(${LINE//:/ })
    LANGUAGE="languages_${PARTS[1]}"
    #echo "${!LANGUAGE}" "${PARTS[0]}"
    echo "| ${!LANGUAGE} (${PARTS[1]}) | ![Progress](http://progress-bar.dev/${PARTS[0]}) |" >> $TABLE_FILE
done
