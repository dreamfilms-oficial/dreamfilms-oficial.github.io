@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Preparando fotos para la web...
echo.
python herramientas\preparar_fotos.py %*
echo.
pause
