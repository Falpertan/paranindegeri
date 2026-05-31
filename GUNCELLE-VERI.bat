@echo off
title Paranin Degeri Veri Guncelleme
cd /d "%~dp0"
if "%TCMB_API_KEY%"=="" (
  echo TCMB_API_KEY ortam degiskeni yok.
  echo Ornek: set TCMB_API_KEY=k2a4MMUbZX
  echo.
  set /p TCMB_API_KEY=API anahtarini girin: 
)
set TCMB_API_KEY=%TCMB_API_KEY%
node tools\fetch-evds.mjs
if errorlevel 1 pause & exit /b 1
echo.
echo Tamam. Git push veya Cloudflare deploy ile herkes gorur.
pause
