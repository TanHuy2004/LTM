@echo off
echo ========================================
echo    BAI TAP MANG MAY TINH
echo    He thong theo doi dang nhap
echo ========================================
echo.
echo Dang lay dia chi IP cua may server...
echo.
node Server/get-ip.js
echo.
echo ========================================
echo Dang khoi dong server...
echo ========================================
echo.
node Server/server.js
