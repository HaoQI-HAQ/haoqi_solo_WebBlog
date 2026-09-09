# Work archive

The Work route loads a Three.js array on demand. Pointer selection, row/column
navigation, damped elevation, outward waves and camera tracking continue from
their current state when interrupted. Only the chosen cassette uses detailed
internal geometry; the surrounding array uses instanced shell geometry.

`motion.ts` is from LBEILC/RhineLabUI and retains its MIT notice in `LICENSE`.
`public/assets/work-archive/archive-cassette.glb` is the user-authorized local
preview asset from that project; its non-code asset rights are not covered by
the code's MIT license. Source: https://github.com/LBEILC/RhineLabUI.

The recorded reference video is not a work video. Real work footage can be
connected via `gameWorks[].videoSrc` after it is supplied. The current three
work records repeat throughout the array; repeated positions are not new works.

Keep preview at http://localhost:5173/work.html, served from
G:/project/haoqi_solo_WebBlog. The homepage title animation is independent.
