[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ArchivePath,

  [Parameter(Mandatory = $true)]
  [string]$SourceDirectory
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archiveFullPath = [System.IO.Path]::GetFullPath($ArchivePath)
$sourceFullPath = [System.IO.Path]::GetFullPath($SourceDirectory).TrimEnd([char[]]@('\', '/'))

if (-not (Test-Path -LiteralPath $archiveFullPath -PathType Leaf)) {
  throw "Upload archive was not found: $archiveFullPath"
}
if (-not (Test-Path -LiteralPath $sourceFullPath -PathType Container)) {
  throw "Package source directory was not found: $sourceFullPath"
}

function Get-StreamSha256 {
  param([Parameter(Mandatory = $true)][System.IO.Stream]$Stream)

  $hasher = [System.Security.Cryptography.SHA256]::Create()
  try {
    return ([System.BitConverter]::ToString($hasher.ComputeHash($Stream))).Replace('-', '').ToLowerInvariant()
  } finally {
    $hasher.Dispose()
  }
}

$sourcePrefix = $sourceFullPath + [System.IO.Path]::DirectorySeparatorChar
$sourceHashes = @{}
foreach ($file in @(Get-ChildItem -LiteralPath $sourceFullPath -Recurse -File)) {
  $relativePath = $file.FullName.Substring($sourcePrefix.Length).Replace('\', '/')
  $sourceStream = [System.IO.File]::OpenRead($file.FullName)
  try {
    $sourceHashes[$relativePath] = Get-StreamSha256 -Stream $sourceStream
  } finally {
    $sourceStream.Dispose()
  }
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($archiveFullPath)
try {
  $archiveEntries = @{}
  foreach ($entry in $zip.Entries) {
    if ($entry.FullName.EndsWith('/')) { continue }
    $entryName = $entry.FullName.Replace('\', '/')
    if ($archiveEntries.ContainsKey($entryName)) {
      throw "Upload archive has duplicate entry: $entryName"
    }
    $archiveEntries[$entryName] = $entry
  }

  $issues = [System.Collections.Generic.List[string]]::new()
  foreach ($relativePath in $sourceHashes.Keys) {
    if (-not $archiveEntries.ContainsKey($relativePath)) {
      $issues.Add("missing archive entry: $relativePath")
      continue
    }

    $stream = $archiveEntries[$relativePath].Open()
    try {
      $archiveHash = Get-StreamSha256 -Stream $stream
    } finally {
      $stream.Dispose()
    }
    if ($archiveHash -ne $sourceHashes[$relativePath]) {
      $issues.Add("content mismatch: $relativePath")
    }
  }

  foreach ($relativePath in $archiveEntries.Keys) {
    if (-not $sourceHashes.ContainsKey($relativePath)) {
      $issues.Add("unexpected archive entry: $relativePath")
    }
  }

  if ($issues.Count -gt 0) {
    throw ('Upload archive differs from its source directory: ' + ($issues -join '; '))
  }

  [pscustomobject]@{
    archive = $archiveFullPath
    source = $sourceFullPath
    files = $sourceHashes.Count
    result = 'match'
  } | ConvertTo-Json -Compress
} finally {
  $zip.Dispose()
}
