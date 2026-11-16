# Gera o Lityra-TV.apk no seu PC (baixa JDK, Android SDK e Gradle uma unica vez, ~1,5 GB).
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$src  = $PSScriptRoot
$work = Join-Path $env:LOCALAPPDATA 'LityraTVBuild'
$dl   = Join-Path $work 'dl'
New-Item -ItemType Directory -Force -Path $work, $dl | Out-Null

function Baixar($url, $arq) {
    if (-not (Test-Path $arq)) { Write-Host "Baixando $url ..."; Invoke-WebRequest -Uri $url -OutFile $arq -UseBasicParsing }
}

# 1) JDK 17
$jdkDir = Get-ChildItem $work -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $jdkDir) {
    $z = Join-Path $dl 'jdk17.zip'
    Baixar 'https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse' $z
    Expand-Archive -Path $z -DestinationPath $work -Force
    $jdkDir = Get-ChildItem $work -Directory -Filter 'jdk-17*' | Select-Object -First 1
}
$env:JAVA_HOME = $jdkDir.FullName
$env:PATH = "$($env:JAVA_HOME)\bin;$($env:PATH)"

# 2) Android SDK
$sdk = Join-Path $work 'android-sdk'
$sdkm = Join-Path $sdk 'cmdline-tools\latest\bin\sdkmanager.bat'
if (-not (Test-Path $sdkm)) {
    $z = Join-Path $dl 'cmdline-tools.zip'
    Baixar 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' $z
    $tmp = Join-Path $work 'cmdtmp'
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    Expand-Archive -Path $z -DestinationPath $tmp -Force
    New-Item -ItemType Directory -Force -Path (Join-Path $sdk 'cmdline-tools') | Out-Null
    Move-Item (Join-Path $tmp 'cmdline-tools') (Join-Path $sdk 'cmdline-tools\latest')
    Remove-Item $tmp -Recurse -Force
}
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
if (-not (Test-Path (Join-Path $sdk 'platforms\android-34')) -or -not (Test-Path (Join-Path $sdk 'build-tools\34.0.0'))) {
    Write-Host 'Instalando componentes do Android SDK...'
    1..30 | ForEach-Object { 'y' } | & $sdkm "--sdk_root=$sdk" --licenses | Out-Null
    & $sdkm "--sdk_root=$sdk" 'platform-tools' 'platforms;android-34' 'build-tools;34.0.0'
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar o Android SDK.' }
}

# 3) Gradle 8.7
$gradleDir = Join-Path $work 'gradle-8.7'
if (-not (Test-Path $gradleDir)) {
    $z = Join-Path $dl 'gradle.zip'
    Baixar 'https://services.gradle.org/distributions/gradle-8.7-bin.zip' $z
    Expand-Archive -Path $z -DestinationPath $work -Force
}

# 4) Compila (copia o projeto para um caminho sem acentos)
$proj = Join-Path $work 'proj'
if (Test-Path $proj) { Remove-Item $proj -Recurse -Force }
New-Item -ItemType Directory -Force -Path $proj | Out-Null
Get-ChildItem $src -Force | Where-Object { $_.Name -notin @('saida','gerar-apk-tv.ps1','Gerar APK da TV.bat','Instalar workflow do APK.bat','build-tv-apk.yml') } |
    ForEach-Object { Copy-Item $_.FullName -Destination $proj -Recurse -Force }
"sdk.dir=" + ($sdk -replace '\\','\\') | Set-Content -Path (Join-Path $proj 'local.properties') -Encoding ASCII

Push-Location $proj
& (Join-Path $gradleDir 'bin\gradle.bat') --no-daemon assembleRelease
$ok = ($LASTEXITCODE -eq 0)
Pop-Location
if (-not $ok) { throw 'A compilacao falhou. Copie a mensagem de erro acima e envie ao Claude.' }

$out = Join-Path $src 'saida'
New-Item -ItemType Directory -Force -Path $out | Out-Null
Copy-Item (Join-Path $proj 'app\build\outputs\apk\release\app-release.apk') (Join-Path $out 'Lityra-TV.apk') -Force
Write-Host "`nPronto: $out\Lityra-TV.apk"
Start-Process explorer.exe $out
