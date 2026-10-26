const mix = (a, b, amount) => a.map((value, i) => Math.round(value * (1 - amount) + b[i] * amount));
const hex = rgb => `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`;
const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));

// Ignore white margins and black lettering when finding the artwork's ink colours.
export function paletteFromPixels(pixels) {
  const bins = new Map();
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 180) continue;
    const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const high = Math.max(...rgb), low = Math.min(...rgb);
    if (high < 45 || low > 226 || high - low < 26) continue;
    const key = rgb.map(value => Math.floor(value / 32)).join(':');
    const bin = bins.get(key) || { total: [0, 0, 0], count: 0 };
    rgb.forEach((value, channel) => { bin.total[channel] += value; });
    bin.count++; bins.set(key, bin);
  }
  const colours = [...bins.values()].sort((a, b) => b.count - a.count)
    .map(bin => bin.total.map(value => Math.round(value / bin.count)));
  const primary = colours[0] || [73, 87, 108];
  const accent = colours.find(colour => distance(colour, primary) > 95) || mix(primary, [197, 186, 151], .65);
  return { primary, accent };
}

export function themeFromPalette(palette = paletteFromPixels([]), kind) {
  const { primary, accent } = palette;
  return {
    shell: hex(kind === 'photo' ? mix([73, 87, 108], primary, .16) : mix(primary, [7, 17, 30], .62)),
    accent: hex(kind === 'photo' ? mix([177, 136, 137], accent, .2) : mix(accent, [195, 193, 148], .3)),
    paper: hex(mix([245, 239, 225], accent, kind === 'music' ? .12 : .04)),
    ink: '#18202a', primary: hex(primary),
  };
}

export function artworkTheme(image, kind) {
  let palette = paletteFromPixels([]);
  if (image) {
    try {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 80;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, 80, 80);
      palette = paletteFromPixels(ctx.getImageData(0, 0, 80, 80).data);
    } catch { /* Remote media without canvas access retains the archival palette. */ }
  }
  return themeFromPalette(palette, kind);
}
