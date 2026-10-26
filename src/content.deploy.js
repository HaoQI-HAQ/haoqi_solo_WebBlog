// 本地或完整静态包保留原有媒体路径；配置 VITE_MEDIA_BASE 后，将
// /media/、/videos/ 下的全部素材指向选定媒体主机，不预设托管平台。

import * as raw from './content.js';
import { getTrackMetadata, getAlbumMetadata } from './work-archive/musicMetadataCatalog.js';

const MEDIA_BASE = String((import.meta.env && import.meta.env.VITE_MEDIA_BASE) || '').replace(/\/+$/, '');
const MEDIA_PREFIXES = ['/media/', '/videos/'];

const rewrite = value => {
  if (typeof value === 'string') {
    if (!MEDIA_BASE) return value;
    return MEDIA_PREFIXES.some(prefix => value.startsWith(prefix)) ? MEDIA_BASE + value : value;
  }
  if (Array.isArray(value)) return value.map(rewrite);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item)]));
  }
  return value;
};

export const siteLaunchDate = raw.siteLaunchDate;
export const languages = rewrite(raw.languages);
export const socials = rewrite(raw.socials);
export const copy = rewrite(raw.copy);
export const gameWorks = rewrite(raw.gameWorks);
// ID3 tags are extracted offline. Merely viewing an album must never fetch MP3s.
export const musicTracks = rewrite(raw.musicTracks.map(album => {
  const metadata = getAlbumMetadata(album.archiveCode);
  return {
    ...album,
    title: metadata.album || album.title,
    image: metadata.cover || album.image,
    tracks: album.tracks?.map(track => {
      const entry = getTrackMetadata(track.id, track.src);
      return { ...track, title: entry.title || track.title, artist: entry.artist || track.artist };
    }),
  };
}));
export const photoAlbums = rewrite(raw.photoAlbums);
export const mapCities = rewrite(raw.mapCities);

export const mediaBase = MEDIA_BASE;
