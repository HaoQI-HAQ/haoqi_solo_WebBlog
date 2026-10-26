import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { musicTracks } from '../content.js';
import { getAlbumMetadata, getTrackMetadata, musicAlbumCatalog, musicTrackCatalog } from './musicMetadataCatalog.js';
import { id3RegionSize, parseId3Text, parseId3v1Text } from '../../scripts/lib/music-id3.mjs';

const syncSafe = value => Buffer.from([(value >> 21) & 127, (value >> 14) & 127, (value >> 7) & 127, value & 127]);
function frame(id, payload, version = 3, flags = 0) {
  const size = version === 4 ? syncSafe(payload.length) : Buffer.alloc(4);
  if (version !== 4) size.writeUInt32BE(payload.length);
  return Buffer.concat([Buffer.from(id), size, Buffer.from([0, flags]), payload]);
}
function tag(frames, version = 3, flags = 0) {
  const body = Buffer.concat(frames);
  return Buffer.concat([Buffer.from([73, 68, 51, version, 0, flags]), syncSafe(body.length), body]);
}
const utf8 = value => Buffer.concat([Buffer.from([3]), Buffer.from(value)]);

test('every published track resolves readable static metadata and an existing album preview', () => {
  const published = musicTracks.filter(album => !album.pending);
  const ids = published.flatMap(album => album.tracks.map(track => track.id));
  assert.equal(ids.length, 163);
  assert.deepEqual(Object.keys(musicTrackCatalog).sort(), [...ids].sort());
  assert.equal(Object.keys(musicAlbumCatalog).length, published.length);
  for (const album of published) {
    const albumMetadata = getAlbumMetadata(album.archiveCode);
    assert.deepEqual(albumMetadata.trackIds, album.tracks.map(track => track.id));
    assert.ok(albumMetadata.cover.startsWith('/media/work-archive/covers/'));
    assert.ok(existsSync(fileURLToPath(new URL(`../../public${albumMetadata.cover}`, import.meta.url))));
    for (const track of album.tracks) {
      const metadata = getTrackMetadata(track.id, track.src);
      for (const key of ['title', 'artist', 'album']) {
        assert.ok(metadata[key].trim(), `${track.id} has a readable ${key}`);
        assert.doesNotMatch(metadata[key], /READING MP3|ID3 ARCHIVE|APIC ARCHIVED/i);
      }
      assert.equal(metadata.cover, albumMetadata.cover);
      assert.ok(metadata.duration === undefined || Number.isFinite(metadata.duration) && metadata.duration > 0);
    }
  }
});

test('browsing all albums remains synchronous with network and blob allocation disabled', async () => {
  const originalFetch = globalThis.fetch;
  const originalObjectURL = URL.createObjectURL;
  globalThis.fetch = () => { throw new Error('Album browsing must not request audio'); };
  URL.createObjectURL = () => { throw new Error('Album browsing must use existing previews'); };
  try {
    const offline = await import(`./musicMetadataCatalog.js?offline=${Date.now()}`);
    for (const [id, track] of Object.entries(musicTrackCatalog)) {
      const metadata = offline.getTrackMetadata(id, track.src);
      assert.equal(metadata.title, track.title);
      assert.equal(typeof metadata.then, 'undefined');
    }
    assert.equal(offline.getAlbumMetadata('SOUND-06').album, 'Luv(sic) Hexalogy');
  } finally {
    globalThis.fetch = originalFetch;
    URL.createObjectURL = originalObjectURL;
  }
});

test('CDN and percent-encoded media URLs retain metadata when the track id is unavailable', () => {
  const [id, track] = Object.entries(musicTrackCatalog).find(([, item]) => item.archiveCode === 'SOUND-06');
  const external = `https://cdn.example.test/prefix${encodeURI(track.src)}?token=temporary`;
  assert.deepEqual(getTrackMetadata('', external), getTrackMetadata(id, track.src));
  assert.equal(getTrackMetadata('missing', '/media/music/new/Some%20Song%20-%20An%20Artist.mp3').title, 'Some Song');
  assert.equal(getTrackMetadata('missing', '/media/music/new/Reol%20-%20Next%20Song.mp3').title, 'Next Song');
  assert.deepEqual(getAlbumMetadata('SOUND-99'), {});
  assert.equal(getTrackMetadata('', '').title, 'Untitled track');
});

test('ID3v2.3 UTF-16LE and ID3v2.4 UTF-8 preserve multilingual text and only declared durations', () => {
  const utf16 = Buffer.concat([Buffer.from([1, 255, 254]), Buffer.from('月光 / 水下', 'utf16le')]);
  const v3 = tag([frame('TIT2', utf16), frame('TPE1', utf8('作曲家')), frame('TALB', utf8('作品集'))]);
  assert.deepEqual(parseId3Text(v3), { title: '月光 / 水下', artist: '作曲家', album: '作品集' });
  const v4 = tag([frame('TIT2', utf8('Track 🎵'), 4), frame('TLEN', utf8('123456'), 4)], 4);
  assert.deepEqual(parseId3Text(v4), { title: 'Track 🎵', duration: 123.456 });
  assert.deepEqual(parseId3Text(tag([frame('TLEN', utf8('not known'))])), {});
});

test('ID3v2.3 extended headers and UTF-16BE text do not become garbled titles', () => {
  const extended = Buffer.alloc(10);
  extended.writeUInt32BE(6);
  const bigEndian = Buffer.from('摄影', 'utf16le').swap16();
  const payload = Buffer.concat([Buffer.from([2]), bigEndian]);
  assert.deepEqual(parseId3Text(tag([extended, frame('TIT2', payload)], 3, 0x40)), { title: '摄影' });
});

test('APIC is skipped and corrupt/truncated tags cannot fabricate metadata', () => {
  const artwork = frame('APIC', Buffer.alloc(1024, 0xff));
  const valid = tag([artwork, frame('TIT2', utf8('After the artwork'))]);
  assert.deepEqual(parseId3Text(valid), { title: 'After the artwork' });
  assert.deepEqual(parseId3Text(valid.subarray(0, 500)), {});
  assert.equal(id3RegionSize(Buffer.from('not an mp3')), 0);
  assert.deepEqual(parseId3Text(Buffer.alloc(10)), {});
  const invalid = Buffer.from(valid);
  invalid[6] = 255;
  assert.equal(id3RegionSize(invalid), 0);
});

test('legacy ID3v2.2 and a valid ID3v1 tail can supply readable fallback text', () => {
  const payload = utf8('Legacy title');
  const header = Buffer.from([84, 84, 50, 0, 0, payload.length]);
  assert.deepEqual(parseId3Text(tag([header, payload], 2)), { title: 'Legacy title' });
  const tail = Buffer.alloc(128);
  tail.write('TAG'); tail.write('Old title', 3); tail.write('Old artist', 33); tail.write('Old album', 63);
  assert.deepEqual(parseId3v1Text(tail), { title: 'Old title', artist: 'Old artist', album: 'Old album' });
  assert.deepEqual(parseId3v1Text(Buffer.alloc(128)), {});
});
