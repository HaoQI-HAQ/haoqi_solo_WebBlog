# Self-hosted portfolio fonts

Retrieved 2026-10-25 from Google Fonts' official webfont service and its official
`google/fonts` source repository. These are the same font families used before
self-hosting. Font outlines and internal family names have not been modified.

| Family | Webfont revision | Included weights and subsets | Copyright |
| --- | --- | --- | --- |
| IBM Plex Mono | Google Fonts v20 | Static 400 / 500; Latin, Latin Extended, Cyrillic | © 2017 IBM Corp.; Reserved Font Name “Plex” |
| Space Grotesk | Google Fonts v22 | Variable 400–700; Latin, Latin Extended | © 2020 The Space Grotesk Project Authors |
| Syne | Google Fonts v24 | Variable 400–800; Latin, Latin Extended | © 2017 The Syne Project Authors |

All three families are distributed under **SIL Open Font License 1.1**. The full
original copyright and license notices are included alongside the fonts:

- [IBM Plex Mono license](./OFL-IBM-Plex-Mono.txt) — [official source](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt)
- [Space Grotesk license](./OFL-Space-Grotesk.txt) — [official source](https://github.com/google/fonts/blob/main/ofl/spacegrotesk/OFL.txt)
- [Syne license](./OFL-Syne.txt) — [official source](https://github.com/google/fonts/blob/main/ofl/syne/OFL.txt)

The OFL permits embedding and redistribution with the software when its notices
and license are retained. These fonts are bundled with the portfolio, not sold
separately. Preserve these license files when copying or deploying this folder.

## Loading and character coverage

`src/fonts.css` declares local `/fonts/` URLs with `font-display: swap`. The exact
Unicode ranges supplied by Google's stylesheet are retained, so each subset is
requested only when its characters are rendered. IBM Plex Mono's Cyrillic subset
keeps the Russian navigation/metadata appearance. Existing system font fallbacks
continue to render Chinese, Japanese, and scripts the selected faces do not cover.
No Google Fonts connections are needed at runtime.

All ten WOFF2 files total **163,752 bytes** (159.9 KiB). The four Latin faces total
**86,492 bytes** (84.5 KiB); extended/Cyrillic files load only as needed. Space
Grotesk and Syne each use a variable face instead of separate files per weight.
Do not preload every subset.

## Reproduction and integrity

The original CSS request was:

<https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400..700&family=Syne:wght@400..800&display=swap>

Individual official download URLs, byte lengths, and SHA-256 checksums are recorded
in [sources.json](./sources.json). `scripts/vendor-fonts.ps1` re-downloads those
exact versioned WOFF2 files and official notices. Downloads are a maintenance
operation; building and running the site uses the checked-in local files.

Run `node scripts/verify-local-fonts.mjs` to verify the files, CSS references, and
license notices without network access. If a font is deliberately updated, review
its official license and refresh the version, checksums, and matching CSS ranges.
