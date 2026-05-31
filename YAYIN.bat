@echo off
cd /d "%~dp0"
set "SRC=%~dp0"
if "%SRC:~-1%"=="\" set "SRC=%SRC:~0,-1%"
set "DEST=C:\Users\Fatih\AppData\Local\Temp\paranindegeri-deploy"
set "REPO=https://github.com/Falpertan/paranindegeri.git"

echo.
echo  Paranin Degeri - Yayina al
echo  ===========================
echo  Kaynak : %SRC%
echo  GitHub : Falpertan/paranindegeri (main)
echo  Site   : https://paranindegeri.com
echo.
echo  ILK KEZ: GitHub'da bos repo olusturun (README kapali):
echo    https://github.com/new  ad: paranindegeri
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo  HATA: git bulunamadi. Git for Windows kurun.
  pause
  exit /b 1
)

if not exist "%DEST%\.git" (
  echo  Ilk calistirma - repo klonlaniyor...
  if exist "%DEST%" rmdir /s /q "%DEST%" 2>nul
  git clone "%REPO%" "%DEST%"
  if errorlevel 1 (
    echo.
    echo  HATA: klon basarisiz.
    echo  Repo olusturdunuz mu? Adi tam olarak paranindegeri mi?
    pause
    exit /b 1
  )
)

cd /d "%DEST%"
if not exist ".git" (
  echo  HATA: %DEST% git reposu degil. Klasoru silip tekrar deneyin:
  echo  %DEST%
  pause
  exit /b 1
)

echo  GitHub ile senkron (Actions commitleri dahil)...
git fetch origin
if errorlevel 1 (
  echo  HATA: fetch basarisiz. Internet veya GitHub girisi kontrol edin.
  pause
  exit /b 1
)
git checkout main 2>nul
git reset --hard origin/main
if errorlevel 1 (
  echo  HATA: origin/main alinamadi.
  pause
  exit /b 1
)

echo  Dosyalar kopyalaniyor...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SRC%\tools\deploy_sync.ps1" -Source "%SRC%" -Dest "%DEST%"
if errorlevel 1 (
  echo  HATA: kopyalama basarisiz.
  pause
  exit /b 1
)

set "MSG=%~1"
if "%MSG%"=="" set "MSG=deploy: Paranin Degeri guncelleme"

git add -A
git diff --cached --quiet
if errorlevel 1 goto DO_COMMIT
echo  Degisiklik yok - push atlandi.
goto DONE

:DO_COMMIT
git -c user.name=Falpertan -c user.email=iletisim.secimarsivi@gmail.com commit -m "%MSG%"
if errorlevel 1 (
  echo  HATA: commit basarisiz.
  pause
  exit /b 1
)
git pull --rebase origin main
if errorlevel 1 (
  echo  HATA: rebase basarisiz. GitHub Actions ile cakisma olabilir.
  echo  Cozum: bu pencerede "git pull --rebase origin main" sonra tekrar YAYIN.bat
  pause
  exit /b 1
)
git push origin main
if errorlevel 1 (
  echo  HATA: push basarisiz. GitHub giris veya repo adi kontrol edin.
  pause
  exit /b 1
)
echo.
echo  BASARILI - Cloudflare Pages bagliysa birka dakika icinde site guncellenir.
echo  Tarayicida Ctrl+Shift+R ile sert yenileme yapin.

:DONE
echo.
pause
