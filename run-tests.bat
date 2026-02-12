@echo off
echo ========================================
echo Antiques Microsite - Test Runner
echo ========================================
echo.

cd /d C:\dev\webfeedpoc

echo Step 1: Installing dependencies (including test packages)...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Step 2: Running test suite...
echo.
call npm test run

echo.
echo ========================================
echo Test run complete!
echo ========================================
echo.
echo To see coverage report, run: npm run test:coverage
echo To use the visual test UI, run: npm run test:ui
echo.
pause
