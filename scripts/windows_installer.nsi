!define NAME     "Icestudio"
!define VERSION  "0.3.0-dev"
!define ARCH     "win64"
!define DIST     "..\dist"
!define CACHE    "..\cache"
!define APP      "${DIST}\icestudio\${ARCH}"
!define PYTHON   "python-2.7.13.amd64.msi"
!define PYPATH   "${CACHE}\python\${PYTHON}"
!define ICON     "${APP}\resources\images\icestudio-logo.ico"

# define name of installer
Name "${NAME} ${VERSION}"

# define output file
OutFile ${DIST}\${NAME}-${VERSION}-${ARCH}.exe

# define installation directory
InstallDir $PROGRAMFILES\${NAME}

# Request application privileges
RequestExecutionLevel admin

# SetCompressor lzma


!include MUI2.nsh
!include Library.nsh

!define MUI_ICON "${ICON}"
!define MUI_BGCOLOR FFFFFF

# Directory page defines
!define MUI_DIRECTORYPAGE_VERIFYONLEAVE

# Run after installing
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Start ${NAME} ${VERSION}"
!define MUI_FINISHPAGE_RUN_FUNCTION "LaunchLink"

# Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

# Languages
!insertmacro MUI_LANGUAGE "English"


Section "Install Python"

  Call ValidatePythonVersion
  Pop $R0

  ${If} $R0 != "0"
    MessageBox MB_YESNO "Python 2.7.13 will be installed. Do you want to continue?" IDYES continue
      Quit

    continue:
      # define output path
      SetOutPath $INSTDIR\python

      # copy Python msi
      File ${PYPATH}

      # execute Python msi
      ExecWait '"msiexec" /i "$INSTDIR\python\${PYTHON}" /passive /norestart ADDLOCAL=ALL'

  ${EndIf}

SectionEnd

Function ValidatePythonVersion

  nsExec::ExecToStack '"python" "-c" "import sys; ver=sys.version_info[:2]; exit({True:0,False:1}[ver==(2,7)])"'

FunctionEnd


Section "${NAME} ${VERSION}"

  # define output path
  SetOutPath $INSTDIR

  # install app files
  File /r "${APP}\"

  # define the uninstaller name
  WriteUninstaller $INSTDIR\uninstaller.exe

  # define shortcut
  CreateDirectory "$SMPROGRAMS\{NAME}"
  CreateShortCut "$SMPROGRAMS\{NAME}\${NAME}.lnk" "$INSTDIR\icestudio.exe" "" "$INSTDIR\resources\images\icestudio-logo.ico" 0
  CreateShortCut "$SMPROGRAMS\{NAME}\Uninstall ${NAME}.lnk" "$INSTDIR\uninstaller.exe"

SectionEnd


Function LaunchLink

 Exec $INSTDIR\icestudio.exe

FunctionEnd


Section "Uninstall"

  # delete the uninstaller
  Delete $INSTDIR\uninstaller.exe

  # delete the installed files
  RMDir /r $INSTDIR
  Delete "$SMPROGRAMS\{NAME}\${NAME}.lnk"
  Delete "$SMPROGRAMS\{NAME}\Uninstall ${NAME}.lnk"
  Delete "$SMPROGRAMS\{NAME}"

SectionEnd
