@echo off
cd /d "%~dp0"
if not exist "..\.github\workflows" mkdir "..\.github\workflows"
copy /Y "build-tv-apk.yml" "..\.github\workflows\build-tv-apk.yml"
echo.
echo Workflow instalado. Agora faca commit e push do repositorio Lityra.
pause
