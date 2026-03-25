$ErrorActionPreference = "Stop"
$mariadbUrl = "https://archive.mariadb.org/mariadb-10.11.4/winx64-packages/mariadb-10.11.4-winx64.zip"
$zipPath = "$env:TEMP\mariadb.zip"
$extractPath = "$env:TEMP\mariadb"

if (-not (Test-Path $extractPath)) {
    Write-Host "Downloading MariaDB..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $mariadbUrl -OutFile $zipPath
    Write-Host "Extracting MariaDB..."
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
}

$installDb = "$extractPath\mariadb-10.11.4-winx64\bin\mysql_install_db.exe"
$dataDir = "$extractPath\data"

if (-not (Test-Path $dataDir)) {
    Write-Host "Initializing data directory..."
    & $installDb --datadir=$dataDir
}

Write-Host "MariaDB setup complete. Ready to start."
