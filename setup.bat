@echo off
echo ========================================
echo Antiques Microsite - Setup Script
echo ========================================
echo.

cd /d C:\dev\webfeedpoc

echo Step 1: Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Please make sure Node.js and npm are installed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy .env.example to .env.local
echo 2. Add your API keys to .env.local
echo 3. Run: npm run dev
echo.
echo To start development server now, type: npm run dev
echo.
pause
