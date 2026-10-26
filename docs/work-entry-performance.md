# Work entry performance

The brief is a hitch when the SVG/logo sequence hands over to the live archive.
Cold-entry captures on 2026-10-23 show no resource responses or media downloads
during that transition. The scene has already rendered 70–75 times, with its 11
shader programs present, before the entry begins. The measured bottleneck is the
increase to continuous rendering, rather than a new network request at handoff.

## Preserving the approved composition

- The repeating field still contains 576 logical archive slots. Each category's
  part meshes now contain only that category's 192 instances, instead of 576 with
  the other categories represented by zero-scaled placeholders. The nine-lane
  window repeats in multiples of the three categories, so this mapping is stable.
  Native ray hits map category-local instance IDs back to the global archive slot.
- Stable cells, string keys and artwork assignments are reused between window
  remaps. A new coordinate object is allocated on remap, preserving a pointer
  press's original coordinates while the camera moves.
- ResizeObserver caches the host and stage dimensions. The render loop uses those
  dimensions instead of synchronously reading layout after the boot layer writes
  SVG, text, filter and transform styles.

The camera, 29% crest position, terrain, breathing, 2048 shadow map, pixel ratio,
materials, covers, opening timing and skip behavior retain their approved values.

## Local measurements

Fresh browser profiles, disabled network cache, 1912×994 viewport. These are local
captures, not a guarantee of a particular frame rate on every device. The timing
column measures the scene's JavaScript and render submission, not GPU timer-query
duration. Shadow/DPR probes varied with system load, so they were not used to
justify a quality reduction.

| Measurement | Before | After |
| --- | ---: | ---: |
| Triangles submitted in the first entrance frame | 120,962 | 40,322 |
| Scene frame processing P95, normal CPU | 13.5 ms | 3.0 ms |
| Entrance frame gaps over 50 ms, normal CPU | 2 | 0 |
| Scene frame processing P95, CPU throttled 4× | 39.6 ms | 10.6 ms |
| Entrance frame gaps over 50 ms, CPU throttled 4× | 24 | 0 |

The CPU-throttled entry returned to its authored 4.5 seconds. No transition-time
resource requests, long tasks or console errors were recorded in the final runs.

Regression coverage includes category pool capacity, matrix/color/atlas identity,
repeating positive/negative windows and real ray hits through packed geometry.
Browser checks exercise actual selection, game/photo/music inspection, vinyl
clearance, return ordering, Reduced sleep and resize invalidation.

Reproduce the timing captures with
`node .taste-skill/profile-work-entry.mjs <label> 1,4`.
The isolated diagnostics and trace JSON stay under `.taste-skill/`, outside the
production bundle.
