# Merge feature/bilingue-seguro to main
Write-Host "=== Merging to Main ===" -ForegroundColor Cyan

# Show current status
Write-Host "`n1. Current status:" -ForegroundColor Yellow
git status

# Switch to main
Write-Host "`n2. Switching to main branch..." -ForegroundColor Yellow
git checkout main

# Fetch latest from origin
Write-Host "`n3. Fetching latest from origin..." -ForegroundColor Yellow
git fetch origin

# Merge feature/bilingue-seguro
Write-Host "`n4. Merging feature/bilingue-seguro into main..." -ForegroundColor Yellow
git merge origin/feature/bilingue-seguro --no-edit

# Push to main
Write-Host "`n5. Pushing merged code to main..." -ForegroundColor Yellow
git push origin main

Write-Host "`n✅ Migration complete! Main branch is now up to date." -ForegroundColor Green
Write-Host "`nCurrent branch:" -ForegroundColor Cyan
git branch

Write-Host "`nLatest commits:" -ForegroundColor Cyan
git log --oneline -5
