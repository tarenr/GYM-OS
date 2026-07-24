@echo off
setlocal

title GYM-OS
cd /d "%~dp0"

echo ========================================
echo GYM-OS - Estrategia Nerd Academy
echo ========================================
echo.
echo Pasta do projeto:
echo %CD%
echo.

if not exist "package.json" (
  echo ERRO: package.json nao encontrado.
  echo Confirme se este arquivo BAT esta dentro da pasta GYM-OS.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Dependencias nao encontradas. Instalando com npm install...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERRO: falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo Abrindo http://localhost:3000 ...
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"

echo.
echo Iniciando servidor...
echo Para parar o GYM-OS, feche esta janela ou pressione CTRL+C.
echo.

call npm start

echo.
echo Servidor finalizado.
pause
