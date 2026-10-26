# Download only the original Google Fonts webfont files and their OFL notices.
# Run from PowerShell: ./scripts/vendor-fonts.ps1
$ErrorActionPreference = 'Stop'
$fontRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public/fonts'))
New-Item -ItemType Directory -Path $fontRoot -Force | Out-Null

$fontSources = @(
    @{ File = 'ibm-plex-mono-latin-400.woff2'; Url = 'https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1i8q1w.woff2' },
    @{ File = 'ibm-plex-mono-latin-ext-400.woff2'; Url = 'https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1iEq129k.woff2' },
    @{ File = 'ibm-plex-mono-cyrillic-400.woff2'; Url = 'https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1isq129k.woff2' },
    @{ File = 'ibm-plex-mono-latin-500.woff2'; Url = 'https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwlBFgg.woff2' },
    @{ File = 'ibm-plex-mono-latin-ext-500.woff2'; Url = 'https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwl5FgtIU.woff2' },
    @{ File = 'ibm-plex-mono-cyrillic-500.woff2'; Url = 'https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwlRFgtIU.woff2' },
    @{ File = 'space-grotesk-latin-400-700.woff2'; Url = 'https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2' },
    @{ File = 'space-grotesk-latin-ext-400-700.woff2'; Url = 'https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPb94C-s0.woff2' },
    @{ File = 'syne-latin-400-800.woff2'; Url = 'https://fonts.gstatic.com/s/syne/v24/8vIH7w4qzmVxm2BL9A.woff2' },
    @{ File = 'syne-latin-ext-400-800.woff2'; Url = 'https://fonts.gstatic.com/s/syne/v24/8vIH7w4qzmVxm25L9Hz_.woff2' },
    @{ File = 'OFL-IBM-Plex-Mono.txt'; Url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/OFL.txt' },
    @{ File = 'OFL-Space-Grotesk.txt'; Url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt' },
    @{ File = 'OFL-Syne.txt'; Url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/syne/OFL.txt' }
)

foreach ($fontSource in $fontSources) {
    $target = Join-Path $fontRoot $fontSource.File
    Invoke-WebRequest -UseBasicParsing -Uri $fontSource.Url -OutFile $target -TimeoutSec 60
    if ($fontSource.File.EndsWith('.woff2')) {
        $signature = [System.Text.Encoding]::ASCII.GetString([System.IO.File]::ReadAllBytes($target), 0, 4)
        if ($signature -ne 'wOF2') { throw "Invalid WOFF2 response: $($fontSource.File)" }
    } elseif (-not (Select-String -LiteralPath $target -SimpleMatch 'SIL OPEN FONT LICENSE Version 1.1' -Quiet)) {
        throw "Expected original SIL OFL 1.1 notice: $($fontSource.File)"
    }
    Write-Output "$($fontSource.File): $((Get-Item -LiteralPath $target).Length) bytes"
}
