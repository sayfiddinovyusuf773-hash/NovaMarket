@echo off
title NovaMarket Server
color 0A
echo ========================================================
echo               NOVAMARKET ISHGA TUSHMOQDA...
echo ========================================================
echo.
cd /d "%~dp0"
echo [1/2] Brauzer ochilmoqda: http://localhost:5173
start http://localhost:5173
echo [2/2] Server ishga tushirilmoqda...
npm run dev
pause
