@echo off
cd /d c:\Users\sarao\Documents\v0-site-de-filmes-main
taskkill /IM node.exe /F >nul 2>&1
timeout /t 2 /nobreak
rmdir /s /q .next >nul 2>&1
npm run dev
