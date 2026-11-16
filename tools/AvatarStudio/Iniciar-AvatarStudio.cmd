@echo off
cd /d "%~dp0"
set "AVATAR_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%AVATAR_PYTHON%" (
  "%AVATAR_PYTHON%" server.py
) else (
  py -3 server.py
)
pause
