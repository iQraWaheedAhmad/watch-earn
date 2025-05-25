# Create fonts directory if it doesn't exist
$fontsDir = "src/fonts"
if (-not (Test-Path $fontsDir)) {
    New-Item -ItemType Directory -Path $fontsDir
}

# Font URLs
$fonts = @{
    "Geist-Regular.woff2" = "https://raw.githubusercontent.com/vercel/geist-font/main/packages/geist-font/fonts/Geist-Regular.woff2"
    "Geist-Medium.woff2" = "https://raw.githubusercontent.com/vercel/geist-font/main/packages/geist-font/fonts/Geist-Medium.woff2"
    "Geist-Bold.woff2" = "https://raw.githubusercontent.com/vercel/geist-font/main/packages/geist-font/fonts/Geist-Bold.woff2"
    "GeistMono-Regular.woff2" = "https://raw.githubusercontent.com/vercel/geist-font/main/packages/geist-mono/fonts/GeistMono-Regular.woff2"
}

# Download each font
foreach ($font in $fonts.GetEnumerator()) {
    $outputPath = Join-Path $fontsDir $font.Key
    Write-Host "Downloading $($font.Key)..."
    Invoke-WebRequest -Uri $font.Value -OutFile $outputPath
}

Write-Host "All fonts downloaded successfully!" 