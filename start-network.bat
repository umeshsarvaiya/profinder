@echo off
echo Starting Profinder for network access...
echo.
echo Frontend will be available at: http://192.168.31.3:3000
echo Backend will be available at: http://192.168.31.3:5000
echo.
echo Make sure your firewall allows connections on ports 3000 and 5000
echo.

REM Start the backend server
cd server
start "Backend Server" cmd /k "npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start the frontend
cd ..
start "Frontend Server" cmd /k "npm start"

echo.
echo Both servers are starting...
echo You can now access the app from your mobile device at: http://192.168.31.3:3000
pause 