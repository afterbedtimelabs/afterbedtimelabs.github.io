@echo off
setlocal
cd /d "%~dp0"
node scripts\launch-ambient.mjs --open
if errorlevel 1 pause
endlocal
