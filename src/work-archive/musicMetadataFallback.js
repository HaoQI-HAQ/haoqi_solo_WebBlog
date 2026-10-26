// Shared by the offline builder and runtime fallback. Source paths may be CDN
// URLs or percent encoded; neither case requires an audio request.
export function canonicalMusicPath(src = '') {
  let path = String(src).replace(/\\/g, '/');
  try { path = new URL(path, 'https://media.invalid').pathname; } catch { path = path.split(/[?#]/)[0]; }
  try { path = decodeURIComponent(path); } catch { /* Keep malformed user filenames readable. */ }
  const mediaStart = path.indexOf('/media/');
  return mediaStart >= 0 ? path.slice(mediaStart) : path;
}

export function readableTrackFilename(src = '') {
  const path = canonicalMusicPath(src);
  const filename = path.split('/').pop().replace(/\.(mp3|m4a|ogg|wav|flac)$/i, '').replace(/_/g, ' ').trim();
  if (!filename) return { title: 'Untitled track', artist: '' };
  const parts = filename.split(' - ');
  if (parts.length < 2) return { title: filename, artist: '' };
  // The archive contains both Artist - Title and Title - Artist filenames.
  const artistFirst = /^(Reol|Hoshina Anniversary|Mariya Ise(?:,.*)?|TCY FORCE|TeddyLoid|Aimee [bB])$/i.test(parts[0]);
  return artistFirst
    ? { title: parts.slice(1).join(' - '), artist: parts[0] }
    : { title: parts.slice(0, -1).join(' - '), artist: parts.at(-1) };
}
