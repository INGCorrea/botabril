@echo off
cd /d c:\botabril

echo === Merging to Main ===
echo.

echo 1. Checking current status...
git status

echo.
echo 2. Switching to main branch...
git checkout main

echo.
echo 3. Fetching latest from origin...
git fetch origin

echo.
echo 4. Merging feature/bilingue-seguro into main...
git merge origin/feature/bilingue-seguro --no-edit

echo.
echo 5. Pushing to main...
git push origin main

echo.
echo ✅ Migration complete!
echo.
git log --oneline -5

pause
