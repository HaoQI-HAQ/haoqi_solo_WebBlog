import { getTrackMetadata } from './musicMetadataCatalog.js';

// Compatibility for older previews. Runtime metadata is a local lookup;
// never download audio or allocate a cover blob just to display tags.
export async function readAudioMetadata(src) {
  return src ? getTrackMetadata(undefined, src) : {};
}
