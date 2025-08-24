@echo off
setlocal

echo [INFO] Checking required tools

call :check node "Node.js"
call :check npm "npm"
call :check java "Java"
call :check gradle "Gradle"

where sdkmanager >nul 2>nul
if %errorlevel%==0 (
  echo [INFO] Android SDK detected
) else if defined ANDROID_HOME (
  echo [INFO] Android SDK detected at %ANDROID_HOME%
) else if defined ANDROID_SDK_ROOT (
  echo [INFO] Android SDK detected at %ANDROID_SDK_ROOT%
) else (
  echo [WARN] Android SDK not found
)

where studio64 >nul 2>nul
if %errorlevel%==0 (
  echo [INFO] Android Studio detected
) else (
  where studio >nul 2>nul
  if %errorlevel%==0 (
    echo [INFO] Android Studio detected
  ) else (
    echo [WARN] Android Studio not found
  )
)

if "%1"=="--check" goto :EOF

echo Select build option:
echo 1^) CLI build (npx cap build android)
echo 2^) Launch Android Studio (npx cap open android)
set /p choice=Enter choice [1/2]: 

if "%choice%"=="1" (
  echo [INFO] Running CLI build (npx cap build android)
  npx cap build android
) else if "%choice%"=="2" (
  echo [INFO] Opening Android Studio (npx cap open android)
  npx cap open android
) else (
  echo [WARN] Invalid choice: %choice%
  exit /b 1
)

goto :EOF

:check
where %1 >nul 2>nul
if %errorlevel%==0 (
  for /f "delims=" %%i in ('where %1') do echo [INFO] %2 detected (%%i)
) else (
  echo [WARN] %2 not found
)
exit /b 0
