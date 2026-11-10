@echo off
title ReadFluently - Interactive Reading Speed Trainer
echo ========================================================
echo        ReadFluently - Children's Reading Trainer
echo ========================================================
echo.
echo Launching ReadFluently...
echo.

python -c "exit(0)" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting local web server with Python on http://localhost:8080 ...
    start "" http://localhost:8080
    python -m http.server 8080
    goto :EOF
)

node -e "process.exit(0)" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting local web server with Node on http://localhost:8080 ...
    start "" http://localhost:8080
    npx serve -l 8080
    goto :EOF
)

echo Opening ReadFluently directly in your default browser...
start "" "%~dp0index.html"
echo.
echo ReadFluently is running!
pause
