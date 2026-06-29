@echo off
cd trustlens-landing
echo Installing dependencies using npm...
call npm.cmd install
echo Starting Vite Dev Server...
call npm.cmd run dev
pause
