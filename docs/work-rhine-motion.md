# Work: Rhine reference motion adaptation

The user requested the opening of [Rhine Lab UI](https://rhine.lubeiluchen.cc/)
on the portfolio's Work subpage, together with its layered, breathing archive field.
This is a refinement of the existing HAOQI archive, not a change to the homepage,
the approved game/photo/music models, or their real artwork.

Sources inspected on 2026-10-23:

- [LBEILC/RhineLabUI](https://github.com/LBEILC/RhineLabUI), MIT, copyright 2026 LBEILC.
- `src/boot.ts`, `boot-motion.ts`, `boot-tracks.ts`, `boot-logo-tracks.ts`,
  `boot-orbit-tracks.ts`, and the accompanying boot verification notes.
- `src/scene.ts`, `motion.ts`, `archive-loop.ts`, and `archive-lighting.ts`.

Derived timeline measurements retain their attribution in
`src/work-archive/bootTimeline.js`; the MIT text is preserved in the adjacent
`LICENSE`. The approved fold-H identity replaces the reference logo. Portfolio,
category, and welcome text replaces reference authentication/identity copy. No
reference font, music, branded model, or PV footage was added. On 2026-10-24 the
user also requested the reference sound effects; their synthesis and tiny typing
excerpts are documented separately in `work-audio-sources.md`.

## Motion mapping

- A pure, seekable 25 fps trajectory drives typing, logo positioning,
  contracting rings, opposite orbit paths and the welcome wipe. It maps portfolio
  seconds to source seconds 5–26.92. The overlay lasts 21.92 seconds, reveals the
  array at 21.16 seconds, and can be skipped immediately. Resource waiting uses
  real scene readiness. Hidden tabs pause its clock.
- The approved fold-H assembles once over 1.1 seconds: two archive leaves close,
  the diagonal bridge connects, then the acid-green tab settles. It uses the same
  boot clock, so hiding/skipping the intro also pauses/stops the mark. Auth and
  welcome hold the completed silhouette; Reduced displays it without spatial
  assembly. A unified final path preserves the approved outline without seams.
- A 4.5 second 3D handoff combines a depth entrance, forward/returning crest and
  camera yaw/elevation settling. Input remains locked through this wave, with a
  separate final-entry skip affordance. Skipping and natural completion converge
  on the same field.
- The stationary height field samples the reference `settlingWave` at 26.56 and
  scales its amplitude by `columnStrength`. Its peak is about 2.203 world units,
  with a shallow negative trough. The focus uses the current damped tracks so
  switching a row does not instantly replace every model height.
- The existing 8 s and 13 s `idleWave` is now used. It fades in after 2.5 idle
  seconds and remains at ±.102 maximum. Neighbours differ in phase; they are not
  independently randomized or rapidly bobbed. Selection still emits signed
  outward packets, clamped to ±.6. Geometry tilt follows the field slope.
- The preview camera is raised from target y=-1.5 to -.05 to accommodate the
  shoulder, retaining the familiar final yaw 59° / elevation 19°. Warm, softer
  lighting and depth fog support the geometry. They do not replace it.

The subsequent composition refinement expands the repeating window from 32 to
64 rows (576 instanced slots; unchanged draw-call count). On wide screens a
screen-space camera offset places the crest near the approved red-box position,
29% of the viewport width;
compact screens keep the centred composition. The actual array extends beyond
the frustum before soft top/bottom/side feathering is applied. A bounded reading
mist retains continuous case texture on the right instead of the old near-opaque
horizontal wash. Inspection framing continues to use the original detail target.

## Interaction and performance

Instance matrices carry the real current height, including for picking. The
selected model is frozen at departure and lifted to a fixed inspection plane;
vinyl clearance uses the raised neighbouring-field bound. Return encloses vinyl
and aligns the model before descent. Reversal mid-transition preserves height.

Full motion remains the default on every visit, as previously requested. The
manual Reduced mode retains the sculpted field without continuous motion. Full
mode runs idle RAF only while visible and browsing; stable inspection and Reduced
sleep. Offscreen and hidden stages suspend rendering. The opening portal isolates
and later restores the global navigation/player; it adds no audio player.

Core verification: 23 motion, fold-mark, packed-instance, geometry, picking, palette and vinyl tests. Browser
verification covers full/skip handoffs, resource waiting, keyboard, default full
mode, desktop/mobile sizes 320/390/768/1440/1860, actual raised-cover selection,
extraction/drag/return, quiet inspection, reduced/offscreen sleep and vinyl ordering.

The category pools and hot-loop caches used for the entry performance fix are
documented in `work-entry-performance.md`, with local before/after measurements.
