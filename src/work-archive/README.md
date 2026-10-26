# Work archive

The Work route loads a Three.js array on demand. Pointer selection, row/column
navigation, damped elevation, outward waves and camera tracking continue from
their current state when interrupted. The array and selected archives now use the
same category silhouettes, covers and per-work palettes. `archiveArray.js` batches
closed cases into instanced meshes with a shared cover atlas, keeping original slot
ids for picking. Unpublished records retain quiet neutral cases.

`motion.ts` is from LBEILC/RhineLabUI and retains its MIT notice in `LICENSE`.
`public/assets/work-archive/archive-cassette.glb` is retained as the original local
preview reference; the Work scene no longer loads it. Its non-code asset rights
are not covered by the code's MIT license. Source: https://github.com/LBEILC/RhineLabUI.

The recorded reference video is not a work video. Real work footage can be
connected via `gameWorks[].videoSrc` after it is supplied. Four published game
records and the remaining placeholders repeat throughout the array; repeated
positions are not new works. WORK-03 and WORK-04 share the real game gallery
component with the homepage. Their media and store links come from `src/content.js`.

`archiveObject.js` builds the three approved model types using real artwork:

- Games: a tinted jewel case with an uninterrupted icon cover, perimeter catches
  and a promotional rear insert. No spindle or clamp covers the character's face.
- Photography: a metal archival frame, warm mount, original-ratio photo, catalog
  card and retaining clips. Its 5 × 3.7 × .35 envelope fits the original 5.2 × .62
  array spacing; panoramic artwork does not change the outer frame's footprint.
- Music: a closed, centred paper sleeve while browsing. Extraction first lifts
  the sleeve, then slides the black vinyl to the right with a restrained turn.
  Return retracts the vinyl before lowering the sleeve into its slot. Interrupting
  and reopening continues from current progress. Embedded APIC supplies the cover.

`artworkCatalog.js` precomputes actual artwork colours and lightweight album covers,
so selecting an archive never changes its neutral case into a coloured one. Rebuild
after editing source artwork with `node scripts/build-archive-artwork.mjs` (Sharp
from the installed runtime, or `SHARP_MODULE`). The 12 APIC covers and one photo
preview live in `public/media/work-archive/covers/` and total approximately 504 KiB.
Include this folder when uploading externally hosted media. `VITE_MEDIA_BASE` also
applies to these previews. Small covers are prepared before the array appears;
selection does not download MP3s just to obtain artwork. The original full photo
is loaded on selection with stale-request disposal; each model owns its cloned
textures, geometries and materials. The array owns its atlas and source textures.
The settled browsing field keeps the reference's broad shoulder and shallow
trough (`settlingWave × columnStrength`), centred on the damped camera tracks.
It never returns to a uniformly flat shelf. After 2.5 seconds without interaction,
8 s / 13 s breathing fades in, with at most ±.102 world-unit displacement and
different phases between neighbouring cases. The browsing camera does not follow
that live height, so it does not cancel the breathing on screen.
Visible full-motion browsing renders continuously. Manual Reduced retains the
same sculpted field but sleeps after transitions settle. Detail views also sleep
once the model is stationary; rotation and completed media wake them. Hidden or
offscreen stages stop RAF in both modes and resume without a large elapsed step.
Every visit or refresh starts with the full authored motion. The visitor can choose
Full/Reduced using the footer button for the current page only; previous saved
choices are ignored. OS reduced-motion settings do not silently replace
the archive animation with jumps. The manual Reduced mode preserves the closed/open
states without the sliding choreography. Selected models stay
vivid while depth fog softens the surrounding array during inspection.
At widths up to 1000px, the camera fits the whole model above the compact detail
panel. Keep the camera's compact fit calculation in sync with that panel's 40%
maximum height and 55px bottom offset in `work-archive.css`.

Entering `/work.html` plays a reference-paced white introduction: terminal typing,
the approved fold-H assembly, portfolio/category lines, contracting rings, and a
welcome wipe. `WorkBoot.jsx` uses a body portal so the site header/player cannot
appear above it, and restores every background sibling's prior inert state on
exit. Its measured tracks retain LBEILC's MIT attribution in `bootTimeline.js` and
`LICENSE`; the mark and wording are HAOQI / STUDIO. Work sound effects now adapt
the reference's Web Audio synthesis and tiny typing bank; attribution and source
boundaries are recorded in `docs/work-audio-sources.md`.
The 21.92 s overlay hands off to a 4.5 s travelling field and camera entrance at
21.16 s (around 25.7 s total). Both phases can be skipped with Enter/Escape or their
visible button. The actual resource state gates handoff; no simulated percentages
or identity-verification claims are shown. Selection remains locked until the
entry wave settles, preventing it from intersecting extracted models.

Inspection freezes the departure altitude and lifts to a fixed safe plane above
the raised terrain before vinyl slides out. Returning holds the current altitude
until the disc is enclosed and the model faces its slot, then descends. Reopening
mid-return preserves position. See `docs/work-rhine-motion.md` for source mapping.

Keep preview at http://localhost:5173/work.html, served from
G:/project/haoqi_solo_WebBlog. The homepage title animation is independent.

Picking must include every visible cassette shell, not only its optical insert:
otherwise a ray passes through the cover and selects a different archive behind it.
Keep the pointer-down selection until release so camera motion cannot change the
clicked archive. Model rotation must invalidate the on-demand renderer.

Run the geometry and palette regressions with
`node --test src/work-archive/scene.test.js src/work-archive/archiveArray.test.js src/work-archive/artworkTheme.test.js src/work-archive/vinylReveal.test.js src/work-archive/arrayMotion.test.js src/work-archive/bootTimeline.test.js src/work-archive/foldMarkMotion.test.js`
(Node 24 or newer). Browser checks must also click the actual canvas, extract the
selected model, drag it after idle, and click empty space to return.

Array parts are packed by category: mesh instance IDs are local and must be mapped
through `mesh.userData.archiveSlots` before indexing `scene.cells`. Use
`arrayModels.getMatrixAt(globalSlot, matrix)` for global-slot diagnostics. See
`docs/work-entry-performance.md` for the entry profiling and cache behavior.

`workSound.js` owns a fresh visual/sound timeline for each Work visit. Production
receives the single, persistent effects bus from `SiteSoundProvider`; the intro,
archive and global dock controls share the default-on `haoqi-site-sound` setting.
The first real gesture unlocks the device automatically. The old Work-only key
is used only by standalone preview/test factories, not by production preferences.
Skip, hidden tabs and Reduced never queue a backlog. Active voices are capped at
ten; ended voices disconnect their nodes. Hidden pages suspend the device; leaving
Work keeps it for the next SPA page, while unmounting the provider closes it.
Music playback ducks only the effects bus to 40%. Run the tests in
`src/audio/siteSound.test.js` and `src/work-archive/workSound.test.js`.
