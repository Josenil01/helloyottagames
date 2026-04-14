param(
  [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$OutputPath = "",
  [string]$CategoryOutputPath = ""
)

$ErrorActionPreference = "Stop"

function Remove-Diacritics([string]$text) {
  if ([string]::IsNullOrEmpty($text)) { return $text }

  $normalized = $text.Normalize([Text.NormalizationForm]::FormD)
  $sb = New-Object System.Text.StringBuilder

  foreach ($ch in $normalized.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$sb.Append($ch)
    }
  }

  return $sb.ToString().Normalize([Text.NormalizationForm]::FormC)
}

function Normalize-Href([string]$href) {
  $decoded = [System.Uri]::UnescapeDataString($href.Trim())
  $parts = $decoded -split "/"
  $encodedParts = foreach ($part in $parts) {
    if ($part -eq "") { "" } else { [System.Uri]::EscapeDataString($part) }
  }

  $path = ($encodedParts -join "/")
  if (-not $path.StartsWith("/")) {
    $path = "/" + $path
  }

  return $path
}

function Build-Slug([string]$hrefPath) {
  $decoded = [System.Uri]::UnescapeDataString($hrefPath)
  $slugBase = $decoded.ToLowerInvariant()
  $slugBase = $slugBase -replace "/index\.html$", "" -replace "\.html$", "" -replace "/", "-"
  $slugBase = Remove-Diacritics $slugBase

  return (($slugBase -replace "[^a-z0-9]+", "-") -replace "(^-|-$)", "")
}

$indexPath = Join-Path $RootPath "index.html"
$cnamePath = Join-Path $RootPath "CNAME"

if (-not (Test-Path $indexPath)) {
  throw "index.html not found at $indexPath"
}

if (-not (Test-Path $cnamePath)) {
  throw "CNAME not found at $cnamePath"
}

$domain = (Get-Content -Raw -Encoding utf8 -Path $cnamePath).Trim()
$html = Get-Content -Raw -Encoding utf8 -Path $indexPath

$cardPattern = '<a\s+href="(?<href>[^"]+)"\s+class="game-card[^"]*"\s+data-category="(?<cat>[^"]+)">\s*<div class="emoji">(?<emoji>.*?)</div>\s*<div class="title">(?<title>.*?)</div>\s*<div class="description">\s*(?<desc>.*?)\s*</div>\s*</a>'
$matches = [regex]::Matches($html, $cardPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)

$games = foreach ($match in $matches) {
  $hrefPath = Normalize-Href $match.Groups["href"].Value

  [ordered]@{
    slug = Build-Slug $hrefPath
    title = $match.Groups["title"].Value.Trim()
    description = (($match.Groups["desc"].Value -replace "\\s+", " ").Trim())
    icon = $match.Groups["emoji"].Value.Trim()
    href = $hrefPath
    url = "https://$domain$hrefPath"
    categories = @($match.Groups["cat"].Value.Trim().Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries))
  }
}

$payload = [ordered]@{
  version = "1.0.0"
  generatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  total = $games.Count
  games = $games
}

$categoryMap = @{}

foreach ($game in $games) {
  foreach ($category in $game.categories) {
    if (-not $categoryMap.ContainsKey($category)) {
      $categoryMap[$category] = New-Object System.Collections.ArrayList
    }
    [void]$categoryMap[$category].Add($game)
  }
}

$categoryKeys = @($categoryMap.Keys | Sort-Object)
$categoriesPayload = foreach ($category in $categoryKeys) {
  [ordered]@{
    slug = $category
    total = $categoryMap[$category].Count
    games = @($categoryMap[$category])
  }
}

$byCategoryPayload = [ordered]@{
  version = "1.0.0"
  generatedAt = $payload.generatedAt
  totalCategories = $categoryKeys.Count
  totalGames = $games.Count
  categories = $categoriesPayload
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path (Join-Path $RootPath "api") "games.json"
}

if ([string]::IsNullOrWhiteSpace($CategoryOutputPath)) {
  $CategoryOutputPath = Join-Path (Join-Path $RootPath "api") "games-by-category.json"
}

$outputDir = Split-Path -Parent $OutputPath
if (-not (Test-Path $outputDir)) {
  New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
}

$categoryOutputDir = Split-Path -Parent $CategoryOutputPath
if (-not (Test-Path $categoryOutputDir)) {
  New-Item -Path $categoryOutputDir -ItemType Directory -Force | Out-Null
}

$json = $payload | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText($OutputPath, $json, [System.Text.UTF8Encoding]::new($false))

$byCategoryJson = $byCategoryPayload | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($CategoryOutputPath, $byCategoryJson, [System.Text.UTF8Encoding]::new($false))

Write-Output "Generated API file: $OutputPath"
Write-Output "Games: $($games.Count)"
Write-Output "Generated category API file: $CategoryOutputPath"
Write-Output "Categories: $($categoryKeys.Count)"
