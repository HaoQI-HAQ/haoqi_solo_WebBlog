import { useEffect, useRef, useState } from 'react';
import { RollingNumber, RollingText } from '@kitlangton/rolling-number/react';
import '@kitlangton/rolling-number/styles.css';
import { WorkScene } from './scene.js';
import { readAudioMetadata } from './audioMetadata.js';
import './work-archive.css';

const workText = {
  mixed: {
    ariaLabel: '作品档案', brand: 'HAOQI / 创作档案', heading: '游戏作品', discipline: '游戏策划 · 视觉系统 · 声音', loading: '正在载入档案', listView: '档案 / 列表视图', connected: '档案 / 已连接', loadingMessage: '正在载入三维档案', fallback: '三维画面暂时不可用，仍可浏览作品档案。', selectedFile: '当前选择', access: '抽取档案', selectionHint: '点击文件夹选择 · 抽取后查看详情', detail: '详情', return: '归位 / 返回档案', footagePending: '作品影像待添加', inspect: '左键长按拖动模型查看', select: '选择', previous: '上一份档案', next: '下一份档案', selectFile: '选择', previousLane: '向左切换档案列', nextLane: '向右切换档案列', browse: '切换档案列', move: '切列', open: '抽取', independent: '独立实践 / 2026', motionReduced: '动态 / 简化', motionFull: '动态 / 完整', archiveSelect: '档案 / 选择', announce: '当前档案',
  },
  zh: {
    ariaLabel: '作品档案', brand: 'HAOQI / 创作档案', heading: '游戏作品', discipline: '游戏策划 · 视觉系统 · 声音', loading: '正在载入档案', listView: '档案 / 列表视图', connected: '档案 / 已连接', loadingMessage: '正在载入三维档案', fallback: '三维画面暂时不可用，仍可浏览作品档案。', selectedFile: '当前选择', access: '抽取档案', selectionHint: '点击文件夹选择 · 抽取后查看详情', detail: '详情', return: '归位 / 返回档案', footagePending: '作品影像待添加', inspect: '左键长按拖动模型查看', select: '选择', previous: '上一份档案', next: '下一份档案', selectFile: '选择', previousLane: '向左切换档案列', nextLane: '向右切换档案列', browse: '切换档案列', move: '切列', open: '抽取', independent: '独立实践 / 2026', motionReduced: '动态 / 简化', motionFull: '动态 / 完整', archiveSelect: '档案 / 选择', announce: '当前档案',
  },
  ja: {
    ariaLabel: '作品アーカイブ', brand: 'HAOQI / クリエイティブアーカイブ', heading: 'ゲーム作品', discipline: 'ゲームデザイン · ビジュアルシステム · サウンド', loading: 'アーカイブを読み込み中', listView: 'アーカイブ / リスト表示', connected: 'アーカイブ / 接続済み', loadingMessage: '3Dアーカイブを読み込み中', fallback: '3D表示は利用できませんが、作品アーカイブは閲覧できます。', selectedFile: '選択中のファイル', access: 'ファイルを抽出', selectionHint: 'フォルダをクリックして選択 · 抽出して詳細を表示', detail: '詳細', return: 'アーカイブに戻る', footagePending: '作品映像は準備中', inspect: '左クリック長押しでモデルをドラッグ', select: '選択', previous: '前のアーカイブ', next: '次のアーカイブ', selectFile: '選択', previousLane: '左のアーカイブ列へ', nextLane: '右のアーカイブ列へ', browse: 'アーカイブ列を切替', move: '移動', open: '開く', independent: '個人制作 / 2026', motionReduced: 'モーション / 軽減', motionFull: 'モーション / フル', archiveSelect: 'アーカイブ / 選択', announce: '選択中のアーカイブ',
  },
  en: {
    ariaLabel: 'Work archive', brand: 'HAOQI / CREATIVE ARCHIVE', heading: 'Selected work', discipline: 'GAME DESIGN · VISUAL SYSTEMS · SOUND', loading: 'LOADING ARCHIVE', listView: 'ARCHIVE / LIST VIEW', connected: 'ARCHIVE / CONNECTED', loadingMessage: 'Loading 3D archive', fallback: 'The 3D view is unavailable; the work archive can still be browsed.', selectedFile: 'SELECTED FILE', access: 'ACCESS FILE', selectionHint: 'Click a folder to select · Extract to view details', detail: 'DETAIL', return: 'RETURN TO ARCHIVE', footagePending: 'Work footage to be added', inspect: 'HOLD LEFT-DRAG TO INSPECT MODEL', select: 'SELECT', previous: 'Previous archive', next: 'Next archive', selectFile: 'Select', previousLane: 'Move to previous archive lane', nextLane: 'Move to next archive lane', browse: 'BROWSE ARCHIVE', move: 'SHIFT', open: 'OPEN', independent: 'INDEPENDENT PRACTICE / 2026', motionReduced: 'MOTION / REDUCED', motionFull: 'MOTION / FULL', archiveSelect: 'ARCHIVE / SELECT', announce: 'CURRENT ARCHIVE',
  },
  ru: {
    ariaLabel: 'Архив работ', brand: 'HAOQI / ТВОРЧЕСКИЙ АРХИВ', heading: 'Игровые работы', discipline: 'ГЕЙМ-ДИЗАЙН · ВИЗУАЛЬНЫЕ СИСТЕМЫ · ЗВУК', loading: 'ЗАГРУЗКА АРХИВА', listView: 'АРХИВ / СПИСОК', connected: 'АРХИВ / ПОДКЛЮЧЕН', loadingMessage: 'Загрузка 3D-архива', fallback: '3D-вид временно недоступен, но архив работ можно просмотреть.', selectedFile: 'ВЫБРАННЫЙ ФАЙЛ', access: 'ИЗВЛЕЧЬ ФАЙЛ', selectionHint: 'Выберите папку · Извлеките файл для просмотра', detail: 'ПОДРОБНОСТИ', return: 'ВЕРНУТЬ В АРХИВ', footagePending: 'Видео работы будет добавлено', inspect: 'УДЕРЖИВАЙТЕ ЛЕВУЮ КНОПКУ И ПЕРЕТАСКИВАЙТЕ МОДЕЛЬ', select: 'ВЫБРАТЬ', previous: 'Предыдущий архив', next: 'Следующий архив', selectFile: 'Выбрать', previousLane: 'Перейти к левой колонке архива', nextLane: 'Перейти к правой колонке архива', browse: 'ЛИСТАТЬ АРХИВ', move: 'СМЕНА', open: 'ОТКРЫТЬ', independent: 'НЕЗАВИСИМАЯ ПРАКТИКА / 2026', motionReduced: 'ДВИЖЕНИЕ / МЕНЬШЕ', motionFull: 'ДВИЖЕНИЕ / ПОЛНОЕ', archiveSelect: 'АРХИВ / ВЫБОР', announce: 'ТЕКУЩИЙ АРХИВ',
  },
};

const archiveMedia = {
  mixed: { games: { title: '游戏作品', discipline: '游戏策划 · 视觉系统 · 声音' }, photo: { title: '摄影作品', discipline: '城市帧组 · 光线研究 · 路径记录' }, music: { title: '音乐唱片', discipline: 'AI 编曲 · 声音研究 · 情绪结构' } },
  zh: { games: { title: '游戏作品', discipline: '游戏策划 · 视觉系统 · 声音' }, photo: { title: '摄影作品', discipline: '城市帧组 · 光线研究 · 路径记录' }, music: { title: '音乐唱片', discipline: 'AI 编曲 · 声音研究 · 情绪结构' } },
  ja: { games: { title: 'ゲーム作品', discipline: 'ゲームデザイン · ビジュアルシステム · サウンド' }, photo: { title: '写真作品', discipline: '都市フレーム · 光の研究 · ルート記録' }, music: { title: '音楽レコード', discipline: 'AI作曲 · 音響研究 · 感情構造' } },
  en: { games: { title: 'Game works', discipline: 'GAME DESIGN · VISUAL SYSTEMS · SOUND' }, photo: { title: 'Photography', discipline: 'CITY FRAMES · LIGHT STUDIES · ROUTE RECORDS' }, music: { title: 'Music records', discipline: 'AI COMPOSITION · SOUND STUDIES · EMOTIONAL STRUCTURE' } },
  ru: { games: { title: 'Игровые работы', discipline: 'ГЕЙМ-ДИЗАЙН · ВИЗУАЛЬНЫЕ СИСТЕМЫ · ЗВУК' }, photo: { title: 'Фотографии', discipline: 'ГОРОДСКИЕ КАДРЫ · ИССЛЕДОВАНИЕ СВЕТА · МАРШРУТЫ' }, music: { title: 'Музыкальные записи', discipline: 'AI-КОМПОЗИЦИЯ · ИССЛЕДОВАНИЕ ЗВУКА · ЭМОЦИОНАЛЬНАЯ СТРУКТУРА' } },
};

const detailCopy = {
  mixed: { blankReturn: '点击空白处归位', video: '项目演示', videoPending: '项目视频待添加', download: '游戏下载', bilibili: 'B站视频', linkPending: '链接待补充', description: '作品背景', gallery: '图片合集', enlarge: '点击放大查看', previousImage: '上一张图片', nextImage: '下一张图片', record: '黑胶唱片', track: '曲目', playRecord: '播放唱片', pauseRecord: '暂停唱片', noAudio: '音源待添加' },
  zh: { blankReturn: '点击空白处归位', video: '项目演示', videoPending: '项目视频待添加', download: '游戏下载', bilibili: 'B站视频', linkPending: '链接待补充', description: '作品背景', gallery: '图片合集', enlarge: '点击放大查看', previousImage: '上一张图片', nextImage: '下一张图片', record: '黑胶唱片', track: '曲目', playRecord: '播放唱片', pauseRecord: '暂停唱片', noAudio: '音源待添加' },
  ja: { blankReturn: '余白をクリックして戻る', video: 'プロジェクト映像', videoPending: '映像は準備中', download: 'ゲームをダウンロード', bilibili: 'Bilibili 動画', linkPending: 'リンク準備中', description: '作品背景', gallery: '画像セット', enlarge: 'クリックで拡大', previousImage: '前の画像', nextImage: '次の画像', record: 'レコード', track: 'トラック', playRecord: 'レコードを再生', pauseRecord: 'レコードを一時停止', noAudio: '音源は準備中' },
  en: { blankReturn: 'CLICK EMPTY SPACE TO RETURN', video: 'PROJECT PLAYBACK', videoPending: 'PROJECT VIDEO PENDING', download: 'DOWNLOAD GAME', bilibili: 'BILIBILI VIDEO', linkPending: 'LINK PENDING', description: 'PROJECT CONTEXT', gallery: 'IMAGE SET', enlarge: 'CLICK TO ENLARGE', previousImage: 'PREVIOUS IMAGE', nextImage: 'NEXT IMAGE', record: 'VINYL RECORD', track: 'TRACK', playRecord: 'PLAY RECORD', pauseRecord: 'PAUSE RECORD', noAudio: 'AUDIO PENDING' },
  ru: { blankReturn: 'НАЖМИТЕ НА ПУСТОЕ МЕСТО, ЧТОБЫ ВЕРНУТЬСЯ', video: 'ДЕМОНСТРАЦИЯ ПРОЕКТА', videoPending: 'ВИДЕО ПРОЕКТА ГОТОВИТСЯ', download: 'СКАЧАТЬ ИГРУ', bilibili: 'ВИДЕО BILIBILI', linkPending: 'ССЫЛКА ГОТОВИТСЯ', description: 'КОНТЕКСТ РАБОТЫ', gallery: 'НАБОР ИЗОБРАЖЕНИЙ', enlarge: 'НАЖМИТЕ ДЛЯ УВЕЛИЧЕНИЯ', previousImage: 'ПРЕДЫДУЩЕЕ ИЗОБРАЖЕНИЕ', nextImage: 'СЛЕДУЮЩЕЕ ИЗОБРАЖЕНИЕ', record: 'ВИНИЛОВАЯ ПЛАСТИНКА', track: 'ТРЕК', playRecord: 'ВОСПРОИЗВЕСТИ', pauseRecord: 'ПАУЗА', noAudio: 'АУДИО ГОТОВИТСЯ' },
};

export default function WorkArchive({ groups, language }) {
  const host = useRef(null), engine = useRef(null), stage = useRef(null), access = useRef(null), close = useRef(null), openDetailRef = useRef(null), closeDetailRef = useRef(null);
  const [selected, setSelected] = useState(0), [column, setColumn] = useState(0), [hovered, setHovered] = useState(null);
  const [status, setStatus] = useState('loading'), [detail, setDetail] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0), [lightbox, setLightbox] = useState(false), [selectedTrackId, setSelectedTrackId] = useState('');
  const [audioMetadata, setAudioMetadata] = useState({});
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const t = workText[language] || workText.mixed;
  const group = groups[column], works = group.items, work = works[selected], media = (archiveMedia[language] || archiveMedia.mixed)[group.id];
  const detailT = detailCopy[language] || detailCopy.mixed;
  const photoFrames = work.images?.length ? work.images : [{ src: work.image, caption: work.title }];
  useEffect(() => {
    let scene;
    try {
      scene = new WorkScene(host.current, groups, ({ groupIndex, itemIndex }) => { setColumn(groupIndex); setSelected(itemIndex); }, setHovered, () => openDetailRef.current?.(), () => closeDetailRef.current?.(), reduced);
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
  openDetailRef.current = openDetail;
  const returnToArray = () => { engine.current?.setDetail(false); setDetail(false); setLightbox(false); access.current?.focus({ preventScroll: true }); };
  closeDetailRef.current = returnToArray;
  useEffect(() => { setGalleryIndex(0); setLightbox(false); setSelectedTrackId(work.tracks?.[0]?.id || ''); }, [work.id]);
  useEffect(() => {
    let active = true;
    if (!detail || group.id !== 'music' || !work.tracks?.length) { setAudioMetadata({}); return () => { active = false; }; }
    Promise.all(work.tracks.map(async track => [track.id, await readAudioMetadata(track.src)])).then(entries => {
      if (active) setAudioMetadata(Object.fromEntries(entries));
    });
    return () => { active = false; };
  }, [detail, group.id, work.id]);
  useEffect(() => {
    if (detail) close.current?.focus({ preventScroll: true });
    const keyboard = e => {
      if (e.target.closest('input,select,textarea,video') || e.ctrlKey || e.metaKey || e.altKey) return;
      if (detail) {
        if (e.key === 'Escape') { e.preventDefault(); returnToArray(); }
        if (group.id === 'photo' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); setGalleryIndex(index => (index + (e.key === 'ArrowRight' ? 1 : -1) + photoFrames.length) % photoFrames.length); }
        return;
      }
      const step = { ArrowUp: ['row',-1], ArrowDown: ['row',1], ArrowLeft: ['lane',-1], ArrowRight: ['lane',1] }[e.key];
      if (step && status === 'ready') { e.preventDefault(); engine.current?.navigate(...step); }
      if (e.key === 'Enter' && !e.target.closest('a,button')) { e.preventDefault(); openDetail(); }
    };
    window.addEventListener('keydown',keyboard); return () => window.removeEventListener('keydown',keyboard);
  }, [detail,status,group.id,work.id,photoFrames.length]);
  const choose = index => {
    if (status === 'ready') engine.current.selectItemIndex(index);
    else setSelected(index);
  };
  const navigate = (axis, delta) => engine.current?.navigate(axis, delta);
  const albumTracks = work.tracks || [];
  const albumMetadata = audioMetadata[albumTracks[0]?.id] || {};
  const albumTitle = albumMetadata.album || work.title;
  const playAlbumTrack = (track) => {
    setSelectedTrackId(track.id);
    window.dispatchEvent(new CustomEvent('haoqi-play-track', { detail: { trackId: track.id } }));
  };
  const roll = { duration: 460, animated: !reduced, motionBlur: true };
  return <main ref={stage} className={`work-array ${detail ? 'is-reading' : ''}`} data-reduced={reduced} aria-label={t.ariaLabel} tabIndex={-1}>
    <div className="work-array-canvas" ref={host} aria-hidden={detail || status === 'error'} />
    <div className="work-array-atmosphere" aria-hidden="true" />
    {detail && <span className="work-array-dismiss" aria-hidden="true">{detailT.blankReturn}</span>}
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
      <div className="work-detail-index"><span>FILE {work.archiveCode}</span><span>REFERENCE AREA</span></div>
      <small>{work.archiveCode} / {work.type}</small><h2>{work.title}</h2>
      <div className="work-detail-meta"><div><small>ARCHIVE TYPE / 类型</small><span>{media.title}</span></div><div><small>COLLECTION / 编号</small><span>{work.archiveCode}</span></div><div><small>FORMAT / 格式</small><span>{work.type}</span></div><div><small>STATUS / 状态</small><span><i /> ARCHIVED / 可读取</span></div></div>
      <div className="work-detail-tabs"><span className="is-active">01 概述</span><span>02 素材</span><span>03 注记</span></div>
      {group.id === 'games' && <div className="work-detail-game">
        <small>{detailT.video}</small>
        {work.videoSrc ? <video key={work.id} controls playsInline preload="metadata" poster={work.image} src={work.videoSrc} /> : <div className="work-detail-video-pending"><img src={work.image} alt={work.title} /><span>{detailT.videoPending}</span></div>}
        <div className="work-detail-actions"><a href={work.downloadUrl?.startsWith('http') ? work.downloadUrl : undefined} target={work.downloadUrl?.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={`work-detail-download ${!work.downloadUrl?.startsWith('http') ? 'is-pending' : ''}`}>{detailT.download} <span>↗</span><small>{!work.downloadUrl?.startsWith('http') && detailT.linkPending}</small></a><a href={work.bilibiliUrl?.startsWith('http') ? work.bilibiliUrl : undefined} target={work.bilibiliUrl?.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={`work-detail-bilibili ${!work.bilibiliUrl?.startsWith('http') ? 'is-pending' : ''}`}>{detailT.bilibili} <span>↗</span><small>{!work.bilibiliUrl?.startsWith('http') && detailT.linkPending}</small></a></div>
        <div className="work-detail-description"><small>{detailT.description}</small><p>{work.summary}</p></div>
      </div>}
      {group.id === 'photo' && <div className="work-detail-photo">
        <div className="work-detail-gallery-heading"><small>{detailT.gallery}</small><span>{String(galleryIndex + 1).padStart(2, '0')} / {String(photoFrames.length).padStart(2, '0')}</span></div>
        <button type="button" className="work-detail-photo-frame" onClick={() => setLightbox(true)} aria-label={detailT.enlarge}><img src={photoFrames[galleryIndex].src} alt={photoFrames[galleryIndex].caption || work.title} /><span>{detailT.enlarge} ↗</span></button>
        <div className="work-detail-photo-nav"><button type="button" onClick={() => setGalleryIndex(index => (index - 1 + photoFrames.length) % photoFrames.length)} aria-label={detailT.previousImage}>←</button><span>{photoFrames[galleryIndex].caption || work.title}</span><button type="button" onClick={() => setGalleryIndex(index => (index + 1) % photoFrames.length)} aria-label={detailT.nextImage}>→</button></div>
      </div>}
      {group.id === 'music' && <div className="work-detail-music">
        <div className="work-album-cover"><img src={albumMetadata.cover || work.image} alt={`${albumTitle} cover`} /><span>{work.archiveCode} / ALBUM</span></div>
        <div className="work-detail-track"><small>{detailT.record} / {detailT.track}</small><strong>{albumTitle}</strong><span>{work.mood || work.type}</span><div className="work-album-tracks" aria-label={`${albumTitle} ${detailT.track}`}>{albumTracks.length ? albumTracks.map((track, index) => { const metadata = audioMetadata[track.id] || {}; return <button type="button" className={selectedTrackId === track.id ? 'is-active' : ''} onClick={() => playAlbumTrack(track)} key={track.id}><b>{String(index + 1).padStart(2, '0')}</b><span>{metadata.title || track.title}</span><em>{metadata.artist || track.artist}</em><i aria-hidden="true">▶</i></button>; }) : <em>{detailT.noAudio}</em>}</div></div>
      </div>}
      <div className="work-array-detail-footer"><span>HAOQI / STUDIO</span><span>{t.inspect}</span></div>
    </section>}
    {lightbox && <div className="work-photo-lightbox" role="dialog" aria-modal="true" aria-label={detailT.enlarge} onClick={() => setLightbox(false)}><button type="button" aria-label={t.return} onClick={() => setLightbox(false)}>×</button><img src={photoFrames[galleryIndex].src} alt={photoFrames[galleryIndex].caption || work.title} /></div>}
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
