@echo off
echo Cleaning up git history...
rmdir /s /q .git

echo Setting up gitignore...
echo node_modules/ > .gitignore
echo .env > .gitignore
echo .next/ >> .gitignore

echo Initializing fresh repo...
git init
git add .gitignore
git commit -m "Add gitignore"

echo Checking for potential secrets...
findstr /s /m /i "eyJ" *.js *.ts *.tsx *.sql 2>nul | findstr /v "node_modules" | findstr /v ".next" > secret_check.txt
echo Check secret_check.txt for any flagged files - remove keys before continuing!
pause

echo Adding all files...
git add .
git commit -m "Clean project"
git branch -M master
git remote add origin https://github.com/achieverslawhub-gif/achievers-law-hub.git
git push -u origin master --force

echo Done! Check the output above for success or errors.
pause