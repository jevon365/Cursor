# Start the full Management App stack locally
# Run from project root: .\start-local.ps1
# Backend + unified app (single frontend). Close each window or Ctrl+C to stop.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$backendDir = Join-Path $root "backend"
$unifiedDir = Join-Path $root "app-unified"

foreach ($d in @($backendDir, $unifiedDir)) {
    if (-not (Test-Path $d)) {
        Write-Host "Missing directory: $d" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting Management App (local)..." -ForegroundColor Cyan
Write-Host "  Backend:      http://localhost:3001" -ForegroundColor Gray
Write-Host "  Unified App:  http://localhost:5173" -ForegroundColor Gray
Write-Host ""

$backendCmd = "Set-Location '$backendDir'; Write-Host 'Backend (3001)' -ForegroundColor Green; npm run dev"
$unifiedCmd = "Set-Location '$unifiedDir'; Write-Host 'Unified App (5173)' -ForegroundColor Green; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", $unifiedCmd

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "Backend and unified app started in separate windows." -ForegroundColor Green
Write-Host "Browser opened to http://localhost:5173" -ForegroundColor Green
Write-Host "Close each window or press Ctrl+C there to stop." -ForegroundColor Gray
