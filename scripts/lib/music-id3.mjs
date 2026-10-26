// Text-only ID3 decoding for the offline catalogue builder. Artwork is already
// represented by artworkCatalog; no APIC buffers or object URLs reach the site.
const syncSafe = bytes => bytes.reduce((value, byte) => (value << 7) | (byte & 0x7f), 0);
const uint32 = bytes => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);

function withoutUnsynchronisation(bytes) {
  const output = [];
  for (let i = 0; i < bytes.length; i += 1) {
    output.push(bytes[i]);
    if (bytes[i] === 0xff && bytes[i + 1] === 0) i += 1;
  }
  return Uint8Array.from(output);
}

function decodeText(payload) {
  if (payload.length < 2) return '';
  const encoding = payload[0];
  let bytes = payload.subarray(1);
  let decoded = '';
  if (encoding === 0) decoded = new TextDecoder('latin1').decode(bytes);
  else if (encoding === 3) decoded = new TextDecoder('utf-8').decode(bytes);
  else if (encoding === 1 || encoding === 2) {
    let bigEndian = encoding === 2;
    if (bytes[0] === 0xfe && bytes[1] === 0xff) { bigEndian = true; bytes = bytes.subarray(2); }
    else if (bytes[0] === 0xff && bytes[1] === 0xfe) bytes = bytes.subarray(2);
    if (bigEndian) {
      const swapped = Uint8Array.from(bytes);
      for (let i = 0; i + 1 < swapped.length; i += 2) [swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
      bytes = swapped;
    }
    decoded = new TextDecoder('utf-16le').decode(bytes);
  }
  return decoded.replace(/^\uFEFF/, '').split('\0').map(part => part.trim()).filter(Boolean).join(' / ');
}

/** The full ID3 region size, including its 10-byte header; 0 means no v2 tag. */
export function id3RegionSize(header) {
  if (header.length < 10 || String.fromCharCode(...header.subarray(0, 3)) !== 'ID3') return 0;
  if (![2, 3, 4].includes(header[3]) || header.subarray(6, 10).some(byte => byte > 127)) return 0;
  return 10 + syncSafe(header.subarray(6, 10));
}

/** Decode title, artist, album and declared TLEN only. Truncated frames are ignored. */
export function parseId3Text(tag) {
  const regionSize = id3RegionSize(tag);
  if (!regionSize) return {};
  const version = tag[3];
  // v2.3 sizes describe the tag before byte stuffing; undo it before scanning.
  let body = tag.subarray(10, Math.min(tag.length, regionSize));
  if (version < 4 && tag[5] & 0x80) body = withoutUnsynchronisation(body);
  let offset = 0;
  if (tag[5] & 0x40) {
    if (version === 2 || body.length < 4) return {}; // v2.2 compression is unsupported.
    const size = version === 4 ? syncSafe(body.subarray(0, 4)) : 4 + uint32(body.subarray(0, 4));
    if (size < 4 || size > body.length) return {};
    offset = size;
  }
  const names = { TIT2: 'title', TT2: 'title', TPE1: 'artist', TP1: 'artist', TALB: 'album', TAL: 'album', TLEN: 'duration', TLE: 'duration' };
  const metadata = {};
  const headerLength = version === 2 ? 6 : 10;
  while (offset + headerLength <= body.length) {
    const idLength = version === 2 ? 3 : 4;
    const id = String.fromCharCode(...body.subarray(offset, offset + idLength));
    if (!new RegExp(`^[A-Z0-9]{${idLength}}$`).test(id)) break;
    const sizeBytes = body.subarray(offset + idLength, offset + idLength + (version === 2 ? 3 : 4));
    const length = version === 2 ? (sizeBytes[0] << 16) | (sizeBytes[1] << 8) | sizeBytes[2]
      : version === 4 ? syncSafe(sizeBytes) : uint32(sizeBytes);
    const start = offset + headerLength;
    if (length <= 0 || start + length > body.length) break;
    const key = names[id];
    if (key) {
      let payload = body.subarray(start, start + length);
      const flags = version === 2 ? 0 : body[offset + 9];
      const compressedOrEncrypted = version === 4 ? flags & 0x0c : flags & 0xc0;
      if (!compressedOrEncrypted) {
        if (version === 4 && (flags & 0x02 || tag[5] & 0x80)) payload = withoutUnsynchronisation(payload);
        if (flags & (version === 4 ? 0x40 : 0x20)) payload = payload.subarray(1); // grouping id
        if (version === 4 && flags & 0x01) payload = payload.subarray(4); // data length indicator
        const value = decodeText(payload);
        if (key === 'duration') {
          const milliseconds = Number(value);
          if (/^\d+$/.test(value) && milliseconds >= 500 && milliseconds <= 28_800_000) metadata.duration = milliseconds / 1000;
        } else if (value) metadata[key] = value;
      }
    }
    offset = start + length;
  }
  return metadata;
}

/** A small ID3v1 tail can fill files which have no usable v2 text. */
export function parseId3v1Text(tail) {
  if (tail.length !== 128 || String.fromCharCode(...tail.subarray(0, 3)) !== 'TAG') return {};
  const field = (from, to) => new TextDecoder('latin1').decode(tail.subarray(from, to)).replace(/\0.*$/, '').trim();
  return Object.fromEntries([['title', field(3, 33)], ['artist', field(33, 63)], ['album', field(63, 93)]].filter(([, value]) => value));
}
