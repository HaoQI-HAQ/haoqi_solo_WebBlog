// The approved fold-H assembles once inside the existing boot clock. No separate
// CSS/WAAPI clock: hiding the tab, seeking and skipping keep every piece in sync.
export const FOLD_MARK_START = 4.16;
export const FOLD_MARK_DURATION = 1.1;
const progress = (time, start, end) => Math.max(0, Math.min(1, (time - start) / (end - start)));
const arrive = value => (1 - 2 ** (-10 * value)) / (1 - 2 ** -10);

export function foldMarkFrame(elapsed, reduced = false) {
  const time = reduced ? FOLD_MARK_DURATION : Number.isFinite(elapsed) ? elapsed : 0;
  const left = arrive(progress(time, 0, .62));
  const right = arrive(progress(time, .08, .72));
  const bridge = arrive(progress(time, .30, .84));
  const tab = arrive(progress(time, .70, FOLD_MARK_DURATION));
  return {
    assembled: time >= FOLD_MARK_DURATION,
    left: { x: -22 * (1 - left), y: 10 * (1 - left), angle: -5 * (1 - left), opacity: .25 + .75 * progress(time, 0, .16) },
    right: { x: 22 * (1 - right), y: -10 * (1 - right), angle: 5 * (1 - right), opacity: .20 + .80 * progress(time, .08, .26) },
    bridge: { scale: bridge, opacity: progress(time, .30, .45) },
    tab: { y: -12 * (1 - tab), angle: -18 * (1 - tab), opacity: progress(time, .70, .86) },
  };
}
