@echo off
title Paranin Degeri EVDS Proxy
cd /d "%~dp0"
echo EVDS proxy baslatiliyor (port 8799)...
echo Bu pencereyi kapatmayin; admin panel acikken calissin.
echo.
node tools\evds-proxy.mjs
pause
