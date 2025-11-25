@echo off
echo Starting picoCalc...
cd /d "%~dp0"
start http://localhost:5173
echo Starting development server...
npm run dev
pause
