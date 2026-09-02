param(
  [Parameter(Mandatory = $true)]
  [string]$PptxPath
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $PptxPath -PathType Leaf)) {
  throw "PPTX fixture is missing: $PptxPath"
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($PptxPath)
try {
  $names = @($archive.Entries | ForEach-Object { $_.FullName })
  $requiredEntries = @(
    '[Content_Types].xml',
    'ppt/presentation.xml'
  )

  foreach ($entry in $requiredEntries) {
    if ($names -notcontains $entry) {
      throw "PPTX fixture is missing required Office Open XML entry: $entry"
    }
  }

  if (-not ($names | Where-Object { $_ -match '^ppt/slides/slide\d+\.xml$' })) {
    throw 'PPTX fixture does not contain a slide XML part.'
  }
} finally {
  $archive.Dispose()
}
