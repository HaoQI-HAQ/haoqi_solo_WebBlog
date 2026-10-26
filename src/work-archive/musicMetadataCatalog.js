import { artworkCatalog } from './artworkCatalog.js';
import { musicAlbumCatalog, musicTrackCatalog } from './musicMetadataCatalogData.js';
import { canonicalMusicPath, readableTrackFilename } from './musicMetadataFallback.js';

const bySource = new Map(Object.values(musicTrackCatalog).map(metadata => [canonicalMusicPath(metadata.src), metadata]));

/** Pure synchronous lookup: never fetch audio, decode artwork, or create a blob. */
export function getTrackMetadata(trackId, src = '') {
  const metadata = musicTrackCatalog[trackId] || bySource.get(canonicalMusicPath(src));
  if (!metadata) return readableTrackFilename(src);
  return { ...metadata, cover: artworkCatalog[metadata.archiveCode]?.cover || '' };
}

export function getAlbumMetadata(archiveCode) {
  const metadata = musicAlbumCatalog[archiveCode];
  if (!metadata) return {};
  return { ...metadata, cover: artworkCatalog[archiveCode]?.cover || '' };
}

export { musicTrackCatalog, musicAlbumCatalog };
