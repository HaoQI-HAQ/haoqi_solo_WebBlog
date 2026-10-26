const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Animations own no application state: cancelling one always exposes the final
// readable layout, including when tabs or motion settings change mid-entrance.
export function enterPage(panel, page, full) {
  const animations = [];
  if (!panel) return () => {};
  for (const element of panel.querySelectorAll('[data-enter]')) {
    const role = element.dataset.enter;
    let frames;
    let duration = 560;
    let delay = role === 'copy' ? 100 : 0;
    if (!full) {
      frames = [{ opacity: .72 }, { opacity: 1 }];
      duration = 140;
      delay = 0;
    } else if (role === 'title') {
      frames = [
        { clipPath: 'inset(0 0 90% 0)', transform: 'translateY(22px)' },
        { clipPath: 'inset(0 0 0% 0)', transform: 'translateY(0)' },
      ];
    } else if (role === 'media' && page === 'photography') {
      // The panorama opens along its own horizontal axis, like a viewfinder.
      frames = [
        { clipPath: 'inset(0 43% 0 43%)', transform: 'scale(1.025)' },
        { clipPath: 'inset(0 0% 0 0%)', transform: 'scale(1)' },
      ];
      duration = 760;
      delay = 70;
    } else if (role === 'media' && page === 'music') {
      frames = [{ transform: 'translateX(-28px)', opacity: .5 }, { transform: 'translateX(0)', opacity: 1 }];
      duration = 620;
      delay = 70;
    } else if (role === 'media') {
      frames = [{ clipPath: 'inset(0 0 12% 0)', opacity: .6 }, { clipPath: 'inset(0 0 0% 0)', opacity: 1 }];
      duration = 620;
      delay = 70;
    } else {
      frames = [{ opacity: .45, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }];
      duration = 400;
    }
    const animation = element.animate(frames, { duration, delay, easing: ease, fill: 'none' });
    animations.push(animation);
  }
  return () => animations.forEach(animation => animation.cancel());
}
