import { useEffect, useRef, useState } from 'react';
import { RollingNumber, RollingText } from '@kitlangton/rolling-number/react';
import '@kitlangton/rolling-number/styles.css';
import { WorkScene } from './scene.js';
import './work-archive.css';

const workText = {
  mixed: {
    ariaLabel: '作品档案', brand: 'HAOQI / 创作档案', heading: '游戏作品', discipline: '游戏策划 · 视觉系统 · 声音', loading: '正在载入档案', listView: '档案 / 列表视图', connected: '档案 / 已连接', loadingMessage: '正在载入三维档案', fallback: '三维画面暂时不可用，仍可浏览作品档案。', selectedFile: '当前选择', access: '抽取档案', selectionHint: '点击文件夹选择 · 抽取后查看详情', detail: '详情', return: '归位 / 返回档案', footagePending: '作品影像待添加', inspect: '拖动模型旋转查看', select: '选择', previous: '上一份档案', next: '下一份档案', selectFile: '选择', previousLane: '向左切换档案列', nextLane: '向右切换档案列', browse: '切换档案列', move: '切列', open: '抽取', independent: '独立实践 / 2026', motionReduced: '动态 / 简化', motionFull: '动态 / 完整', archiveSelect: '档案 / 选择', announce: '当前档案',
  },
  zh: {
    ariaLabel: '作品档案', brand: 'HAOQI / 创作档案', heading: '游戏作品', discipline: '游戏策划 · 视觉系统 · 声音', loading: '正在载入档案', listView: '档案 / 列表视图', connected: '档案 / 已连接', loadingMessage: '正在载入三维档案', fallback: '三维画面暂时不可用，仍可浏览作品档案。', selectedFile: '当前选择', access: '抽取档案', selectionHint: '点击文件夹选择 · 抽取后查看详情', detail: '详情', return: '归位 / 返回档案', footagePending: '作品影像待添加', inspect: '拖动模型旋转查看', select: '选择', previous: '上一份档案', next: '下一份档案', selectFile: '选择', previousLane: '向左切换档案列', nextLane: '向右切换档案列', browse: '切换档案列', move: '切列', open: '抽取', independent: '独立实践 / 2026', motionReduced: '动态 / 简化', motionFull: '动态 / 完整', archiveSelect: '档案 / 选择', announce: '当前档案',
  },
  ja: {
    ariaLabel: '作品アーカイブ', brand: 'HAOQI / クリエイティブアーカイブ', heading: 'ゲーム作品', discipline: 'ゲームデザイン · ビジュアルシステム · サウンド', loading: 'アーカイブを読み込み中', listView: 'アーカイブ / リスト表示', connected: 'アーカイブ / 接続済み', loadingMessage: '3Dアーカイブを読み込み中', fallback: '3D表示は利用できませんが、作品アーカイブは閲覧できます。', selectedFile: '選択中のファイル', access: 'ファイルを抽出', selectionHint: 'フォルダをクリックして選択 · 抽出して詳細を表示', detail: '詳細', return: 'アーカイブに戻る', footagePending: '作品映像は準備中', inspect: 'モデルをドラッグして確認', select: '選択', previous: '前のアーカイブ', next: '次のアーカイブ', selectFile: '選択', previousLane: '左のアーカイブ列へ', nextLane: '右のアーカイブ列へ', browse: 'アーカイブ列を切替', move: '移動', open: '開く', independent: '個人制作 / 2026', motionReduced: 'モーション / 軽減', motionFull: 'モーション / フル', archiveSelect: 'アーカイブ / 選択', announce: '選択中のアーカイブ',
  },
  en: {
    ariaLabel: 'Work archive', brand: 'HAOQI / CREATIVE ARCHIVE', heading: 'Selected work', discipline: 'GAME DESIGN · VISUAL SYSTEMS · SOUND', loading: 'LOADING ARCHIVE', listView: 'ARCHIVE / LIST VIEW', connected: 'ARCHIVE / CONNECTED', loadingMessage: 'Loading 3D archive', fallback: 'The 3D view is unavailable; the work archive can still be browsed.', selectedFile: 'SELECTED FILE', access: 'ACCESS FILE', selectionHint: 'Click a folder to select · Extract to view details', detail: 'DETAIL', return: 'RETURN TO ARCHIVE', footagePending: 'Work footage to be added', inspect: 'DRAG MODEL TO INSPECT', select: 'SELECT', previous: 'Previous archive', next: 'Next archive', selectFile: 'Select', previousLane: 'Move to previous archive lane', nextLane: 'Move to next archive lane', browse: 'BROWSE ARCHIVE', move: 'SHIFT', open: 'OPEN', independent: 'INDEPENDENT PRACTICE / 2026', motionReduced: 'MOTION / REDUCED', motionFull: 'MOTION / FULL', archiveSelect: 'ARCHIVE / SELECT', announce: 'CURRENT ARCHIVE',
  },
  ru: {
    ariaLabel: 'Архив работ', brand: 'HAOQI / ТВОРЧЕСКИЙ АРХИВ', heading: 'Игровые работы', discipline: 'ГЕЙМ-ДИЗАЙН · ВИЗУАЛЬНЫЕ СИСТЕМЫ · ЗВУК', loading: 'ЗАГРУЗКА АРХИВА', listView: 'АРХИВ / СПИСОК', connected: 'АРХИВ / ПОДКЛЮЧЕН', loadingMessage: 'Загрузка 3D-архива', fallback: '3D-вид временно недоступен, но архив работ можно просмотреть.', selectedFile: 'ВЫБРАННЫЙ ФАЙЛ', access: 'ИЗВЛЕЧЬ ФАЙЛ', selectionHint: 'Выберите папку · Извлеките файл для просмотра', detail: 'ПОДРОБНОСТИ', return: 'ВЕРНУТЬ В АРХИВ', footagePending: 'Видео работы будет добавлено', inspect: 'ПЕРЕТАЩИТЕ МОДЕЛЬ ДЛЯ ОСМОТРА', select: 'ВЫБРАТЬ', previous: 'Предыдущий архив', next: 'Следующий архив', selectFile: 'Выбрать', previousLane: 'Перейти к левой колонке архива', nextLane: 'Перейти к правой колонке архива', browse: 'ЛИСТАТЬ АРХИВ', move: 'СМЕНА', open: 'ОТКРЫТЬ', independent: 'НЕЗАВИСИМАЯ ПРАКТИКА / 2026', motionReduced: 'ДВИЖЕНИЕ / МЕНЬШЕ', motionFull: 'ДВИЖЕНИЕ / ПОЛНОЕ', archiveSelect: 'АРХИВ / ВЫБОР', announce: 'ТЕКУЩИЙ АРХИВ',
  },
};

const archiveMedia = {
  mixed: { games: { title: '游戏作品', discipline: '游戏策划 · 视觉系统 · 声音' }, photo: { title: '摄影作品', discipline: '城市帧组 · 光线研究 · 路径记录' }, music: { title: '音乐唱片', discipline: 'AI 编曲 · 声音研究 · 情绪结构' } },
  zh: { games: { title: '游戏作品', discipline: '游戏策划 · 视觉系统 · 声音' }, photo: { title: '摄影作品', discipline: '城市帧组 · 光线研究 · 路径记录' }, music: { title: '音乐唱片', discipline: 'AI 编曲 · 声音研究 · 情绪结构' } },
  ja: { games: { title: 'ゲーム作品', discipline: 'ゲームデザイン · ビジュアルシステム · サウンド' }, photo: { title: '写真作品', discipline: '都市フレーム · 光の研究 · ルート記録' }, music: { title: '音楽レコード', discipline: 'AI作曲 · 音響研究 · 感情構造' } },
  en: { games: { title: 'Game works', discipline: 'GAME DESIGN · VISUAL SYSTEMS · SOUND' }, photo: { title: 'Photography', discipline: 'CITY FRAMES · LIGHT STUDIES · ROUTE RECORDS' }, music: { title: 'Music records', discipline: 'AI COMPOSITION · SOUND STUDIES · EMOTIONAL STRUCTURE' } },
  ru: { games: { title: 'Игровые работы', discipline: 'ГЕЙМ-ДИЗАЙН · ВИЗУАЛЬНЫЕ СИСТЕМЫ · ЗВУК' }, photo: { title: 'Фотографии', discipline: 'ГОРОДСКИЕ КАДРЫ · ИССЛЕДОВАНИЕ СВЕТА · МАРШРУТЫ' }, music: { title: 'Музыкальные записи', discipline: 'AI-КОМПОЗИЦИЯ · ИССЛЕДОВАНИЕ ЗВУКА · ЭМОЦИОНАЛЬНАЯ СТРУКТУРА' } },
};

export default function WorkArchive({ groups, language }) {
  const host = useRef(null), engine = useRef(null), stage = useRef(null), access = useRef(null), close = useRef(null);
  const [selected, setSelected] = useState(0), [column, setColumn] = useState(0), [hovered, setHovered] = useState(null);
  const [status, setStatus] = useState('loading'), [detail, setDetail] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const t = workText[language] || workText.mixed;
  const group = groups[column], works = group.items, work = works[selected], media = (archiveMedia[language] || archiveMedia.mixed)[group.id];
  useEffect(() => {
    let scene;
    try {
      scene = new WorkScene(host.current, groups, ({ groupIndex, itemIndex }) => { setColumn(groupIndex); setSelected(itemIndex); }, setHovered, reduced);
      engine.current = scene; scene.onError = () => setStatus('error');
      scene.load().then(() => { if (!scene.disposed) setStatus('ready'); }).catch(() => { if (!scene.disposed) setStatus('error'); });
    } catch { setStatus('error'); }
    return () => { scene?.dispose(); engine.current = null; };
  }, [groups]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { engine.current?.setReduced(reduced); }, [reduced]);
  const openDetail = () => {
    if (status !== 'ready') return;
    engine.current.setDetail(true); setDetail(true); setHovered(null);
  };
  const returnToArray = () => { engine.current?.setDetail(false); setDetail(false); access.current?.focus({ preventScroll: true }); };
  useEffect(() => {
    if (detail) close.current?.focus({ preventScroll: true });
    const keyboard = e => {
      if (e.target.closest('input,select,textarea,video') || e.ctrlKey || e.metaKey || e.altKey) return;
      if (detail) { if (e.key === 'Escape') { e.preventDefault(); returnToArray(); } return; }
      const step = { ArrowUp: ['row',-1], ArrowDown: ['row',1], ArrowLeft: ['lane',-1], ArrowRight: ['lane',1] }[e.key];
      if (step && status === 'ready') { e.preventDefault(); engine.current?.navigate(...step); }
      if (e.key === 'Enter' && !e.target.closest('a,button')) { e.preventDefault(); openDetail(); }
    };
    window.addEventListener('keydown',keyboard); return () => window.removeEventListener('keydown',keyboard);
  }, [detail,status]);
  const choose = index => {
    if (status === 'ready') engine.current.selectItemIndex(index);
    else setSelected(index);
  };
  const navigate = (axis, delta) => engine.current?.navigate(axis, delta);
  const roll = { duration: 460, animated: !reduced, motionBlur: true };
  return <main ref={stage} className={`work-array ${detail ? 'is-reading' : ''}`} data-reduced={reduced} aria-label={t.ariaLabel} tabIndex={-1}>
    <div className="work-array-canvas" ref={host} aria-hidden={detail || status === 'error'} />
    <div className="work-array-atmosphere" aria-hidden="true" />
    <div className="work-array-heading"><p>{t.brand}</p><h1>{media.title}</h1><span>{media.discipline}</span></div>
    <div className="work-array-state"><i />{status === 'loading' ? t.loading : status === 'error' ? t.listView : t.connected}</div>
    {status === 'loading' && <div className="work-array-loading" role="status"><span>{t.loadingMessage}</span><i /></div>}
    {status === 'error' && <div className="work-array-fallback"><p>{t.fallback}</p>{works.map((item,index) => <button key={item.id} onClick={()=>choose(index)} aria-pressed={selected===index}>{item.archiveCode} / {item.title}</button>)}</div>}
    <section className="work-array-selection" aria-label={t.announce} hidden={detail}>
      <p className="work-array-eyebrow">WORK ARCHIVE <span>/</span> {media.title} <span>/</span> {t.selectedFile}</p>
      <div className="work-array-code"><RollingText {...roll} text={work.archiveCode} transition="direct" stagger="none" /></div>
      <div className="work-array-title"><RollingText {...roll} text={work.title} transition="direct" stagger="none" /></div>
      <p className="work-array-type">{work.type}</p>
      <button ref={access} type="button" className="work-array-access" onClick={openDetail} disabled={status!=='ready'}>{t.access} <span>↗</span></button>
      <span className="work-array-hint">{t.selectionHint}</span>
    </section>
    {detail && <section className="work-array-detail" aria-label={`${work.archiveCode} ${t.detail}`}>
      <button type="button" className="work-array-return" ref={close} onClick={returnToArray}>← {t.return} <kbd>ESC</kbd></button>
      <small>{work.archiveCode} / {work.type}</small><h2>{work.title}</h2><p>{work.summary}</p>
      {work.videoSrc ? <video key={work.id} controls playsInline preload="metadata" poster={work.image} src={work.videoSrc} /> : <><img src={work.image} alt={work.title} /><span className="work-array-pending">{t.footagePending}</span></>}
      <div className="work-array-detail-footer"><span>HAOQI / STUDIO</span><span>{t.inspect}</span></div>
    </section>}
    <div className="work-array-hover" aria-live="off">{hovered !== null && !detail ? `${(archiveMedia[language] || archiveMedia.mixed)[hovered.group.id].title} / ${hovered.item.archiveCode} / ${hovered.item.title}` : '\u00a0'}</div>
    <footer className="work-array-controls" hidden={detail}>
      <div className="work-array-counter"><small>{t.archiveSelect}</small><div><RollingNumber {...roll} value={selected+1} format={{ minimumIntegerDigits: 2 }} /><span>/ {String(works.length).padStart(2,'0')}</span></div></div>
      <div className="work-array-navigator"><button aria-label={t.previous} disabled={status!=='ready'} onClick={()=>navigate('row',-1)}>↑</button><div className="work-array-ticks">{works.map((item,index)=><button key={item.id} aria-label={`${t.selectFile} ${item.archiveCode}`} aria-pressed={selected===index} onClick={()=>choose(index)} className={selected===index?'is-selected':''}><i/><span>{item.archiveCode}</span></button>)}</div><button aria-label={t.next} disabled={status!=='ready'} onClick={()=>navigate('row',1)}>↓</button></div>
      <div className="work-array-lanes"><button aria-label={t.previousLane} disabled={status!=='ready'} onClick={()=>navigate('lane',-1)}>←</button><span>{media.title} <b>{String(column + 1).padStart(2, '0')} / {String(groups.length).padStart(2, '0')}</b></span><button aria-label={t.nextLane} disabled={status!=='ready'} onClick={()=>navigate('lane',1)}>→</button></div>
      <div className="work-array-instructions">↑ ↓ {t.select} <span>/</span> ← → {t.move} {media.title} <span>/</span> ENTER {t.open}</div>
    </footer>
    <div className="work-array-bottom"><span>{t.independent}</span><button type="button" aria-pressed={reduced} onClick={()=>setReduced(v=>!v)}>{reduced ? t.motionReduced : t.motionFull}</button></div>
    <p className="work-array-announcement" aria-live="polite">{t.announce}: {work.archiveCode} {work.title}</p>
  </main>;
}
