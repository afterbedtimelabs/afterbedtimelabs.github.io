@echo off
cd /d "%~dp0"
if not exist "dist\index.html" (
  echo Production build missing. Run npm.cmd ci and npm.cmd run validate first.
  pause
  exit /b 1
)
echo Open http://127.0.0.1:4355/ after the server reports ready.
echo This serves the existing production build. Press Ctrl+C to stop.
call npm.cmd run preview -- --host 127.0.0.1 --port 4355
