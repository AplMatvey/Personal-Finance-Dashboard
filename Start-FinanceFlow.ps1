$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $portableRoot = Join-Path $env:LOCALAPPDATA 'FinanceFlowTools'
    $portableNode = Get-ChildItem -LiteralPath $portableRoot -Filter 'node-v22*-win-x64' -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    if (-not $portableNode) { throw 'Install Node.js 22.12 or newer, then run this launcher again.' }
    $env:Path = $portableNode.FullName + ';' + $env:Path
}
if (-not (Test-Path -LiteralPath 'node_modules')) {
    npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
}
npm.cmd run dev -- --open
