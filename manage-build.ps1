# 1. Configuration - matches your filenames exactly
$composeFile = ".pdi.build.compose.yml"
$envFile = ".env"
$serviceName = "pdi"

# 2. Extract image name from the YAML (e.g., pdi:0.5.1)
$line = Get-Content $composeFile | Select-String "image:"
$fullImage = $line.ToString().Split(":")[-2..-1] -join ":"
$fullImage = $fullImage.Trim()
$tarFile = $fullImage.Replace(":", "-") + ".tar"

Clear-Host
Write-Host "--- Docker Deployment Manager ---" -ForegroundColor Blue
Write-Host "Target Image: $fullImage" -ForegroundColor Cyan
Write-Host "1. Build & Export"
Write-Host "2. Export Only"
Write-Host "3. Exit"

$choice = Read-Host "Select [1-3]"

if ($choice -eq "1") {
    Write-Host "Starting Build..." -ForegroundColor Cyan
    # We specify 'pdi' as the service to build
    docker compose -f $composeFile --env-file $envFile build $serviceName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Exporting $fullImage..." -ForegroundColor Cyan
        docker save -o $tarFile $fullImage
        Write-Host "Success! Created $tarFile" -ForegroundColor Green
    }
    else {
        Write-Host "Build failed. Check the error above." -ForegroundColor Red
    }
}

if ($choice -eq "2") {
    Write-Host "Exporting existing $fullImage..." -ForegroundColor Cyan
    docker save -o $tarFile $fullImage
    if ($LASTEXITCODE -eq 0) { Write-Host "Success!" -ForegroundColor Green }
}

else {
    Write-Host "Exiting..."
}

