@echo off
echo 正在准备部署文件...

REM 确保配置正确
copy config-production.js config.js
copy index-production.html index.html  
copy inventory-production.html inventory.html
copy stock-in-production.html stock-in.html

echo 文件准备完成！
echo 请手动拖拽文件夹到 Netlify: c:/Users/shuos/Desktop/作业
echo.
pause