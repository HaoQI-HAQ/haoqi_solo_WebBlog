import assert from 'node:assert/strict';
import test from 'node:test';
import { musicTracks } from '../content.deploy.js';
import { readAudioMetadata } from './audioMetadata.js';

test('deployed content exposes readable static tags without changing track identity or playback paths', async () => {
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Metadata must not download audio'); };
  try {
    const albums = musicTracks.filter(album => !album.pending);
    assert.equal(albums.length, 12);
    assert.equal(albums.flatMap(album => album.tracks).length, 163);
    for (const album of albums) {
      for (const track of album.tracks) {
        assert.ok(track.title && !track.title.includes('READING MP3'));
        assert.ok(track.artist);
        const legacy = await readAudioMetadata(track.src);
        assert.equal(legacy.title, track.title);
        assert.equal(legacy.artist, track.artist);
      }
    }
  } finally { globalThis.fetch = fetchBefore; }
});
