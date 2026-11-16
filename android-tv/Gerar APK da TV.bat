@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "gerar-apk-tv.ps1"
echo.
pause
