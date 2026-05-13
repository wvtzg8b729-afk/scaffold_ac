# Brug: .\scripts\git.ps1 status
# Finder Git fra GitHub Desktop hvis `git` ikke er i PATH (Windows).

$paths = @(
  "$env:LOCALAPPDATA\GitHubDesktop\app-3.5.1\resources\app\git\cmd\git.exe",
  "$env:LOCALAPPDATA\GitHubDesktop\app-3.4.20\resources\app\git\cmd\git.exe",
  "${env:ProgramFiles}\Git\cmd\git.exe"
)

$gitExe = $paths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $gitExe) {
  $cmd = Get-Command git -ErrorAction SilentlyContinue
  if ($cmd) { $gitExe = $cmd.Source }
}

if (-not $gitExe) {
  Write-Error "Git blev ikke fundet. Installer Git for Windows eller GitHub Desktop."
  exit 127
}

& $gitExe @args
exit $LASTEXITCODE
