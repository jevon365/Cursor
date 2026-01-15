@echo off
REM Simple server launcher - tries Python, then Node.js
echo Starting Circus Maximus server...
echo.

REM Try Python first
python server.py 2>nul
if not errorlevel 1 goto :end

REM Try Node.js if Python failed
node server.js 2>nul
if not errorlevel 1 goto :end

REM Neither worked
echo.
echo ERROR: Neither Python nor Node.js found!
echo.
echo Please install one of these:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
echo Or use VS Code Live Server extension instead.
echo.
pause
exit /b 1

:end
pause
