@echo off
ECHO ===================================
ECHO IremeHub LMS - Application Starter
ECHO ===================================
ECHO.

:: Check if server and client directories exist
IF NOT EXIST "server" (
  ECHO Server directory not found!
  EXIT /B 1
)

IF NOT EXIST "client" (
  ECHO Client directory not found!
  EXIT /B 1
)

:: Kill any existing Node.js processes that might be using the ports
ECHO Stopping any existing Node.js processes...
taskkill /F /IM node.exe > nul 2>&1

:: Start the server
ECHO.
ECHO Starting the server...
start cmd /k "cd server && node start-server.js"

:: Wait a moment for the server to start
ECHO Waiting for server to start...
timeout /t 5 /nobreak > nul

:: Configure client environment
ECHO.
ECHO Setting up client environment...
cd client && node setup-env.js

:: Start the client
ECHO.
ECHO Starting the client...
start cmd /k "cd client && npm run dev"

ECHO.
ECHO ===================================
ECHO Application starting! Please wait...
ECHO - Server should be available at http://localhost:5000
ECHO - Client should be available at http://localhost:3000
ECHO ===================================

:: Return to root directory
cd .. 