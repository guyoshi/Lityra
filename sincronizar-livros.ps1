# Sincronizacao dinamica de TODOS os livros de Dimensoes Infinitas com o Lityra.
# Mantem IDs, manifestos, audio e preferencias de acesso existentes.
# O script canonico so publica os capitulos .md que ja contenham texto real.
$ErrorActionPreference = "Stop"
$app = $PSScriptRoot
$parent = Split-Path $app -Parent
$grandparent = Split-Path $parent -Parent
$candidates = @(
  $parent,
  $grandparent,
  (Join-Path $parent "dimensoesinfinitas"),
  (Join-Path $parent "Dimensoes Infinitas"),
  (Join-Path $parent "Dimensões Infinitas"),
  (Join-Path $grandparent "dimensoesinfinitas"),
  (Join-Path $grandparent "Dimensões Infinitas")
)
$root = $null
foreach ($candidate in $candidates) {
  if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
  $scriptPath = Join-Path $candidate "Central-Dimensoes-Infinitas\sincronizar_lityra.py"
  if (Test-Path -LiteralPath $scriptPath -PathType Leaf) {
    $root = (Resolve-Path -LiteralPath $candidate).Path
    break
  }
}
if (-not $root) {
  Write-Host "[ERRO] Nao encontrei a pasta 'dimensoesinfinitas' junto ao Lityra." -ForegroundColor Red
  Write-Host "Clona/atualiza os dois repositorios como pastas irmas e executa de novo."
  exit 2
}
$scriptPath = Join-Path $root "Central-Dimensoes-Infinitas\sincronizar_lityra.py"
$editor = Join-Path $root "Editor de Livros"
if (-not (Test-Path -LiteralPath $editor -PathType Container)) {
  Write-Host "[ERRO] Pasta Editor de Livros nao encontrada: $editor" -ForegroundColor Red
  exit 2
}
$commonArguments = @($scriptPath, "--root", $root, "--app", $app, "--editor", $editor, "--apply")

function Invoke-LityraSync([string]$mode) {
  $modeArguments = @($commonArguments + @("--mode", $mode))
  if (Get-Command "py" -ErrorAction SilentlyContinue) {
    & py -3 @modeArguments
  } elseif (Get-Command "python" -ErrorAction SilentlyContinue) {
    & python @modeArguments
  } else {
    Write-Host "[ERRO] Python nao encontrado. Instala o Python 3 para sincronizar." -ForegroundColor Red
    exit 2
  }
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] A sincronizacao de $mode terminou com problemas (codigo $LASTEXITCODE)." -ForegroundColor Red
    exit $LASTEXITCODE
  }
}

# Primeiro publica manuscritos e manifestos; em seguida publica os MP3
# já exportados pelo Fish Audio e liga cada capítulo ao seu áudio no Lityra.
Invoke-LityraSync "books"
Invoke-LityraSync "audio"
Write-Host "[OK] Catalogo, capitulos e audios sincronizados. Para publicar no GitHub, confirme o commit e push do Lityra." -ForegroundColor Green
