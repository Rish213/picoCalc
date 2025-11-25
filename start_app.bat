@echo off
cd /d "%~dp0"
echo Starting picoCalc...

if not exist "node_modules" (
    echo First run detected. Installing dependencies...
    call npm install
)

start http://localhost:5173
echo Starting development server...
npm run dev
pause
