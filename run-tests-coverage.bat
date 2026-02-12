@echo off
echo Running tests with coverage report...
cd /d C:\dev\webfeedpoc
call npm run test:coverage
pause
