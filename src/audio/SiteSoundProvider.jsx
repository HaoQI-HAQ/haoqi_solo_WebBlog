import { createContext, useContext, useEffect, useState } from 'react';
import { createSoundController } from './siteSound.js';
import { attachSiteSoundActions } from './siteSoundEvents.js';

const initial = { enabled: true, unlocked: false, unavailable: false };
const silentSound = Object.freeze(Object.fromEntries(['play', 'activate', 'gesture', 'toggle', 'stop', 'setEnabled'].map(key => [key, () => false])));
const SoundContext = createContext({ sound: silentSound, state: initial });

export function SiteSoundProvider({ children }) {
  const [sound, setSound] = useState(null), [state, setState] = useState(initial);
  useEffect(() => {
    const controller = createSoundController({ onState: next => setState(previous =>
      Object.keys(next).every(key => next[key] === previous[key]) ? previous : next) });
    const detach = attachSiteSoundActions(controller);
    setSound(controller);
    return () => { detach(); controller.dispose(); };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.sound = state.enabled ? 'on' : 'off';
    return () => { delete document.documentElement.dataset.sound; };
  }, [state.enabled]);
  return <SoundContext.Provider value={{ sound: sound || silentSound, state }}>{children}</SoundContext.Provider>;
}

export const useSiteSound = () => useContext(SoundContext);
