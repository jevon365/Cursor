# Quick Verification Script for Deployment Readiness
# Run this to verify your app is ready to deploy

Write-Host "🔍 Verifying Management App Deployment Readiness..." -ForegroundColor Cyan
Write-Host ""

# Check if backend has start script
Write-Host "✓ Checking backend package.json..." -ForegroundColor Green
if (Test-Path "backend/package.json") {
    $backendPkg = Get-Content "backend/package.json" | ConvertFrom-Json
    if ($backendPkg.scripts.start) {
        Write-Host "  ✓ Backend has 'start' script: $($backendPkg.scripts.start)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Backend missing 'start' script!" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ backend/package.json not found!" -ForegroundColor Red
}

# Check if frontend apps have build scripts
Write-Host ""
Write-Host "✓ Checking frontend apps..." -ForegroundColor Green

$app = "app-unified"
if (Test-Path "$app/package.json") {
    $pkg = Get-Content "$app/package.json" | ConvertFrom-Json
    if ($pkg.scripts.build) {
        Write-Host "  ✓ $app has 'build' script" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $app missing 'build' script!" -ForegroundColor Red
    }
    if ($pkg.scripts.serve) {
        Write-Host "  ✓ $app has 'serve' script" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $app missing 'serve' script (optional)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ $app/package.json not found!" -ForegroundColor Red
}

# Check deployment files
Write-Host ""
Write-Host "✓ Checking deployment configuration files..." -ForegroundColor Green
$deployFiles = @(
    "DEPLOYMENT.md",
    "DEPLOYMENT_QUICKSTART.md",
    "QUICK_DEPLOY.md",
    "railway.json",
    "render.yaml"
)

foreach ($file in $deployFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file missing!" -ForegroundColor Red
    }
}

# Check database schema
Write-Host ""
Write-Host "✓ Checking database schema..." -ForegroundColor Green
if (Test-Path "backend/src/db/schema.sql") {
    Write-Host "  ✓ schema.sql exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ schema.sql not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Verification complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Read DEPLOYMENT_QUICKSTART.md for step-by-step guide" -ForegroundColor White
Write-Host "  2. Choose Railway (recommended) or Render" -ForegroundColor White
Write-Host "  3. Follow the deployment guide to get your app live!" -ForegroundColor White
Write-Host ""
