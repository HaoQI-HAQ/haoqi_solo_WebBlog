# Homepage arcade

The homepage mounts `ArcadeInvaders` between the hero and `#work`. The existing
hero, navigation and Work scene are unchanged. `/#arcade` links directly to it.

- `invadersEngine.js` is a deterministic, renderer-independent 640×720 simulation.
  It uses fixed 1/120 s ticks, caps a frame at 100 ms, and emits short audio events.
  All entity coordinates are top-left; explosion coordinates are their center.
- `invadersRenderer.js` draws pixel sprites, HUD and damage into Canvas2D. It
  preserves the caller's transform; whole logical-pixel backing dimensions avoid
  seams between shield blocks when the screen is resized.
- `ArcadeInvaders.jsx` owns the opt-in RAF loop, localized interface, local best
  score, keyboard and pointer input. It never exposes simulation state on window.
- `invadersSound.js` synthesizes short cues with Web Audio. Game sound defaults on
  and follows the site's sound preference, with an additional local mute. Its
  audio context is created only when a visitor starts/resumes the game or enables
  local sound during a run. Muting the site immediately stops existing game voices;
  the disabled local switch cannot override site mute. It does not add
  another audio element or use the site's music collection as a soundtrack.

Controls are arrows/A/D and Space while the canvas is focused; P/Escape pauses.
Enter starts/resumes. Touch buttons use pointer capture and independently track
each finger, including cancel/lost-capture. Tab and site navigation remain native.

Idle and game-over screens do not run RAF. Leaving the cabinet, hiding the tab,
blurring the window, or scrolling the game offscreen pauses an active run. The
visitor must explicitly resume. Unmounting cancels RAF, observers/listeners and
audio voices. `haoqi-invaders-best-v1` stores only the best score; storage failure
falls back to a session score.

This is an original browser implementation of the classic gameplay, with an
on-page attribution to TAITO's 1978 original. It is not an emulator. No network,
external artwork, downloaded audio, or additional dependencies are needed.

Verify core rules with `node --test src/arcade/invadersEngine.test.js`. Browser QA
also covers native keys, two-finger move/fire, focus/menu isolation, layout in five
languages at 320/390/768/1440 px, persistent records, and natural game-over/restart.
Site sound QA also checks that a fresh homepage creates no game context before
starting, game sound starts on the first trusted start gesture, global mute stops
shots and disables the local sound switch, and global unmute preserves local mute.
Starting/pausing emits one site UI cue; movement and repeated fire add no UI clicks.
