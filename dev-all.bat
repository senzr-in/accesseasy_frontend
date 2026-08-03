@echo off
REM ============================================================
REM  AccessEasy — Run All 3 Apps Simultaneously (Dev Mode)
REM  Patrol   → http://localhost:5173
REM  Security → http://localhost:5174
REM  Workforce → http://localhost:5175
REM ============================================================

echo Starting all AccessEasy apps in dev mode...
echo.
echo  [Patrol]    http://localhost:5173
echo  [Security]  http://localhost:5174
echo  [Workforce] http://localhost:5175
echo.

start "AccessEasy Patrol :5173"    cmd /k "npm run dev:patrol"
start "AccessEasy Security :5174"  cmd /k "npm run dev:security"
start "AccessEasy Workforce :5175" cmd /k "npm run dev:workforce"

echo All 3 dev servers launched in separate windows.
echo Close each window individually to stop a server.
