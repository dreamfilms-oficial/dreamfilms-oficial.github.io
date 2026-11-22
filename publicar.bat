@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === 1/2  Preparando fotos ===
python herramientas\preparar_fotos.py || goto error
echo.
echo === 2/2  Subiendo la web a GitHub ===
python herramientasersion.py
git add -A
git commit -m "Actualizar web %date% %time:~0,5%" || echo (No habia cambios nuevos)
git push || goto error
echo.
echo Listo. En 1-2 minutos estara en https://dreamfilms-oficial.github.io
pause
exit /b 0
:error
echo.
echo Algo ha fallado. Copia el mensaje de arriba y pide ayuda.
pause
exit /b 1
