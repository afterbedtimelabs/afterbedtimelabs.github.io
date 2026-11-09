@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not on PATH. Install Node.js 22.12 or later, then reopen this launcher.
  pause
  exit /b 1
)
node scripts\launch-continuity.mjs --open
if errorlevel 1 pause
endlocal
