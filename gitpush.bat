@echo off
git config --global user.email "ponmathan@iwinxdigital.com"
git config --global user.name "Ponmathan-senzr"
git checkout -b feature/qr-assignment-and-ui-updates
git add .
git commit -m "feat: resolve QR assignment and apply complete UI updates"
git push -u origin feature/qr-assignment-and-ui-updates
