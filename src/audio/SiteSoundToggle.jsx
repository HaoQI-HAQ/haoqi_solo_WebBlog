import { useSiteSound } from './SiteSoundProvider.jsx';

const copy = {
  mixed: ['音效 / 开', '音效 / 关', '音效不可用', '关闭全站音效', '开启全站音效'],
  zh: ['音效 / 开', '音效 / 关', '音效不可用', '关闭全站音效', '开启全站音效'],
  en: ['Sound / on', 'Sound / off', 'Sound unavailable', 'Mute site sounds', 'Enable site sounds'],
  ja: ['サウンド / ON', 'サウンド / OFF', 'サウンド利用不可', 'サイトの音を消す', 'サイトの音を有効に'],
  ru: ['Звук / вкл.', 'Звук / выкл.', 'Звук недоступен', 'Выключить звук сайта', 'Включить звук сайта'],
};

export default function SiteSoundToggle({ language = 'mixed', className = '', state: suppliedState, onClick }) {
  const shared = useSiteSound(), state = suppliedState || shared.state;
  const words = copy[language] || copy.mixed;
  const label = words[state.unavailable ? 2 : state.enabled ? 0 : 1];
  return <button type="button" className={`site-sound-toggle ${className}`} data-site-sound-toggle data-work-sound-toggle
    disabled={state.unavailable} aria-pressed={state.enabled && !state.unavailable} aria-label={state.unavailable ? words[2] : words[state.enabled ? 3 : 4]}
    onClick={onClick || (() => shared.sound?.toggle())} title={label}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m11 4-6 5H2v6h3l6 5V4Z" />
      {state.enabled ? <><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></> : <path d="m16 9 6 6m0-6-6 6" />}
    </svg><span>{label}</span>
  </button>;
}
