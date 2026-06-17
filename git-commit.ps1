# Git commit script for advanced validations
Push-Location c:\botabril

Write-Host "Staging files..." -ForegroundColor Cyan
git add utils/validators.js handlers/messageHandler.js utils/i18n.js VALIDATION_QUICK_REFERENCE.md VALIDATION_RESEARCH_GUIDE.md VALIDATION_IMPLEMENTATION_EXAMPLES.md VALIDATION_SCENARIOS_MEDICAL_CHATBOT.md

Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m "Add robust validations: phone format, spam detection, retry limits, and enhanced security checks"

Write-Host "Pushing to feature/bilingue-seguro..." -ForegroundColor Cyan
git push origin feature/bilingue-seguro

Write-Host "Done!" -ForegroundColor Green
Pop-Location
