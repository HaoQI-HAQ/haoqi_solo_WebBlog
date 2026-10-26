// The record stays at the sleeve's vertical centre; the slight turn is about its own spindle.
// Progress is supplied by the scene so reduced motion and return sequencing share one clock.
export function createVinylReveal(sleeve, vinyl) {
  let progress = 0;
  const setReveal = value => {
    progress = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
    sleeve.position.x = progress ? -.77 * progress : 0;
    vinyl.position.x = .98 * progress;
    vinyl.rotation.z = -Math.PI * .14 * progress;
    vinyl.visible = progress > .0001;
  };
  setReveal(0);
  return { setReveal, get revealProgress() { return progress; } };
}
