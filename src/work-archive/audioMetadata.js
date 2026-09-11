const metadataCache = new Map();

const syncSafe = bytes => ((bytes[0] & 127) << 21) | ((bytes[1] & 127) << 14) | ((bytes[2] & 127) << 7) | (bytes[3] & 127);
const utf16be = bytes => {
  const copy = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length - 1; index += 2) { copy[index] = bytes[index + 1]; copy[index + 1] = bytes[index]; }
  return new TextDecoder('utf-16le').decode(copy);
};
const text = (bytes, encoding) => {
  if (!bytes.length) return '';
  if (encoding === 0) return new TextDecoder('latin1').decode(bytes);
  if (encoding === 3) return new TextDecoder().decode(bytes);
  if (encoding === 2) return utf16be(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return utf16be(bytes.subarray(2));
  const start = bytes[0] === 0xff && bytes[1] === 0xfe ? 2 : 0;
  return new TextDecoder('utf-16le').decode(bytes.subarray(start));
};
const trimText = value => value.replace(/^\uFEFF|\0/g, '').trim();
const terminator = (bytes, start, encoding) => {
  if (encoding === 0 || encoding === 3) return Math.max(start, bytes.indexOf(0, start));
  for (let index = start; index < bytes.length - 1; index += 2) if (bytes[index] === 0 && bytes[index + 1] === 0) return index;
  return bytes.length;
};
const coverFromFrame = payload => {
  const encoding = payload[0], mimeEnd = payload.indexOf(0, 1);
  if (mimeEnd < 0 || mimeEnd + 2 >= payload.length) return '';
  const descriptionStart = mimeEnd + 2;
  const descriptionEnd = terminator(payload, descriptionStart, encoding);
  const image = payload.subarray(Math.min(payload.length, descriptionEnd + (encoding === 0 || encoding === 3 ? 1 : 2)));
  if (!image.length) return '';
  const mime = image[0] === 0x89 && image[1] === 0x50 ? 'image/png' : image[0] === 0xff && image[1] === 0xd8 ? 'image/jpeg' : 'application/octet-stream';
  return URL.createObjectURL(new Blob([image], { type: mime }));
};

export async function readAudioMetadata(url) {
  if (!url) return {};
  if (metadataCache.has(url)) return metadataCache.get(url);
  const request = fetch(url).then(async response => {
    if (!response.ok) return {};
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (new TextDecoder('latin1').decode(bytes.subarray(0, 3)) !== 'ID3') return {};
    const version = bytes[3], end = Math.min(bytes.length, 10 + syncSafe(bytes.subarray(6, 10)));
    const metadata = {};
    for (let offset = 10; offset + 10 <= end;) {
      const id = new TextDecoder('latin1').decode(bytes.subarray(offset, offset + 4));
      const size = version === 4 ? syncSafe(bytes.subarray(offset + 4, offset + 8)) : new DataView(bytes.buffer, bytes.byteOffset + offset + 4, 4).getUint32(0);
      if (!id.trim() || !size || offset + 10 + size > end) break;
      const payload = bytes.subarray(offset + 10, offset + 10 + size);
      if (id === 'TIT2') metadata.title = trimText(text(payload.subarray(1), payload[0]));
      if (id === 'TPE1') metadata.artist = trimText(text(payload.subarray(1), payload[0]));
      if (id === 'TALB') metadata.album = trimText(text(payload.subarray(1), payload[0]));
      if (id === 'APIC' && !metadata.cover) metadata.cover = coverFromFrame(payload);
      offset += 10 + size;
    }
    return metadata;
  }).catch(() => ({}));
  metadataCache.set(url, request);
  return request;
}
