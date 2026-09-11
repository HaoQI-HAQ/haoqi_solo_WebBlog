export const siteLaunchDate = '2026-09-04T00:00:00+08:00';

export const languages = [
  { code: 'zh', label: '中' },
  { code: 'ja', label: '日' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

export const socials = [
  { label: 'Email', href: 'mailto:1370228191@qq.com', value: '1370228191@qq.com' },
  { label: 'Bilibili', href: 'https://space.bilibili.com/65369165?spm_id_from=333.1387.0.0', value: '我的 B 站首页' },
  { label: 'GitHub', href: 'https://github.com/HaoQI-HAQ/haoqi_solo_WebBlog', value: 'HaoQI-HAQ' },
  { label: 'X / Twitter', href: '#social-pending', value: '待补充' },
  { label: 'Instagram', href: '#social-pending', value: '待补充' },
];

export const copy = {
  zh: {
    nav: ['首页', '游戏作品', '摄影', '音乐CD', '联系'],
    heroKicker: '游戏策划 · 视觉设计 · AI 编曲',
    heroTitle: '把玩法、影像与声音做成可以进入的世界。',
    heroBody: '先按作品集档案馆的结构搭底：游戏作品、摄影系统、音乐分析与侧边栏播放器都先可运行，后续再逐步替换真实内容。',
    explore: '进入作品',
    aboutTitle: '一半在系统里，一半在感觉里。',
    aboutBody: '我是浩祈。这个站点会逐步记录游戏作品、音乐分析和摄影路线。当前保持静态前端，上传与后台管理等功能后续再接存储和后端。',
    workTitle: '游戏作品',
    musicTitle: '个人音乐分析',
    photoTitle: '摄影作品',
    photoIntro: '摄影系统先按城市标签、年份归档、每组帧数、详情页和灯箱组织；图片暂用现有素材占位。',
    mapTitle: '拍摄城市地图',
    mapNote: '地图已并入摄影页面。当前是抽象占位图，后续可替换为中国 GeoJSON / SVG，并把每个城市关联到摄影相册。',
    uploadTitle: '上传图片入口',
    uploadBody: '当前是前端占位：真正上线的上传需要登录、对象存储和后端校验。这里先保留界面位置。',
    contactTitle: '联系与社交',
    runtime: '网站运行时间',
    days: '天',
    nowPlaying: '侧边栏播放器',
    noAudio: '音频文件待添加',
    download: '下载 / 跳转',
    allCities: '全部城市',
    allYears: '全部年份',
    frames: '帧',
    viewSet: '查看详情',
    openLightbox: '打开灯箱',
    close: '关闭',
    previous: '上一张',
    next: '下一张',
    camera: '器材',
    date: '日期',
  },
  ja: {
    nav: ['ホーム', 'ゲーム作品', '写真', '音楽CD', '連絡'],
    heroKicker: 'ゲームデザイン · ビジュアル · AI 作曲',
    heroTitle: '遊び、映像、音を、入れる世界にする。',
    heroBody: 'まずは作品アーカイブ、写真システム、音楽分析、サイドプレイヤーが動く土台を用意しました。',
    explore: '作品を見る',
    aboutTitle: '半分はシステム、半分は感覚。',
    aboutBody: '私は HAOQI。このサイトはゲーム、音楽分析、写真の旅を少しずつ記録します。',
    workTitle: 'ゲーム作品',
    musicTitle: '音楽分析',
    photoTitle: '写真作品',
    photoIntro: '都市タグ、年別アーカイブ、フレーム数、詳細、ライトボックスで整理します。',
    mapTitle: '撮影都市マップ',
    mapNote: '地図は写真ページに統合しました。後で中国 GeoJSON / SVG に差し替えます。',
    uploadTitle: '画像アップロード',
    uploadBody: '現在は UI の入口のみです。本番アップロードには認証、ストレージ、サーバー側検証が必要です。',
    contactTitle: '連絡とSNS',
    runtime: 'サイト稼働時間',
    days: '日',
    nowPlaying: 'サイドプレイヤー',
    noAudio: '音源は未追加',
    download: 'ダウンロード / 移動',
    allCities: '全都市',
    allYears: '全年',
    frames: '枚',
    viewSet: '詳細を見る',
    openLightbox: 'ライトボックス',
    close: '閉じる',
    previous: '前へ',
    next: '次へ',
    camera: '機材',
    date: '日付',
  },
  en: {
    nav: ['Home', 'Game Works', 'Photography', 'Music CD', 'Contact'],
    heroKicker: 'Game design · Visual direction · AI composition',
    heroTitle: 'I shape play, image and sound into worlds you can enter.',
    heroBody: 'The working base now follows an archive structure: games, photography, music notes and a persistent side player.',
    explore: 'Explore work',
    aboutTitle: 'Half system, half feeling.',
    aboutBody: 'I am Haoqi. This site will grow into an archive for games, music notes and photographic routes. Uploads and admin editing can come later.',
    workTitle: 'Game Works',
    musicTitle: 'Music Notes',
    photoTitle: 'Photography',
    photoIntro: 'The photography system starts with city tags, year archives, frame counts, detail views and a lightbox.',
    mapTitle: 'Shooting Map',
    mapNote: 'The map is integrated into the photography page and can later be replaced with China GeoJSON / SVG data.',
    uploadTitle: 'Image Upload Entry',
    uploadBody: 'This is a front-end placeholder. Real production uploads need auth, object storage and server-side validation.',
    contactTitle: 'Contact & Social',
    runtime: 'Site runtime',
    days: 'days',
    nowPlaying: 'Side Player',
    noAudio: 'Audio pending',
    download: 'Download / Open',
    allCities: 'All cities',
    allYears: 'All years',
    frames: 'frames',
    viewSet: 'View details',
    openLightbox: 'Open lightbox',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    camera: 'Camera',
    date: 'Date',
  },
  ru: {
    nav: ['Главная', 'Игры', 'Фото', 'Музыка CD', 'Контакты'],
    heroKicker: 'Игровой дизайн · Визуал · AI музыка',
    heroTitle: 'Я собираю игру, образ и звук в миры, куда можно войти.',
    heroBody: 'Основа готова: игры, фотоархив, музыкальные заметки и боковой плеер.',
    explore: 'Смотреть работы',
    aboutTitle: 'Половина система, половина чувство.',
    aboutBody: 'Я Haoqi. Этот сайт постепенно станет архивом игр, музыкальных заметок и фотографических маршрутов.',
    workTitle: 'Игровые работы',
    musicTitle: 'Музыкальный анализ',
    photoTitle: 'Фотография',
    photoIntro: 'Фотоархив начинается с городских тегов, годов, числа кадров, деталей и лайтбокса.',
    mapTitle: 'Карта съёмок',
    mapNote: 'Карта встроена в страницу фотографии. Позже можно заменить её China GeoJSON / SVG.',
    uploadTitle: 'Загрузка изображений',
    uploadBody: 'Сейчас это только интерфейс. Для настоящей загрузки нужны вход, объектное хранилище и серверная проверка.',
    contactTitle: 'Контакты и соцсети',
    runtime: 'Сайт работает',
    days: 'дней',
    nowPlaying: 'Боковой плеер',
    noAudio: 'Аудио позже',
    download: 'Скачать / открыть',
    allCities: 'Все города',
    allYears: 'Все годы',
    frames: 'кадров',
    viewSet: 'Подробнее',
    openLightbox: 'Открыть',
    close: 'Закрыть',
    previous: 'Назад',
    next: 'Далее',
    camera: 'Камера',
    date: 'Дата',
  },
};

export const gameWorks = [
  {
    id: 'fragmented-life',
    number: '01',
    archiveCode: 'WORK-01',
    title: '残片人生',
    type: '游戏项目 / 作品记录',
    summary: '《残片人生》游戏项目。完整演示可在 B 站观看；本地项目视频待补充。',
    image: '/media/placeholders/archive-black.svg',
    videoUrl: '',
    downloadUrl: '#download-pending',
    bilibiliUrl: 'https://www.bilibili.com/video/BV1t1rpBLE7Z',
    status: 'Bilibili demo',
  },
  {
    id: 'nuo-mask-prisoner',
    number: '02',
    archiveCode: 'WORK-02',
    title: '傩面之囚',
    type: '游戏项目 / 作品记录',
    summary: '《傩面之囚》游戏项目。完整演示可在 B 站观看；本地项目视频待补充。',
    image: '/media/placeholders/archive-black.svg',
    videoUrl: '#video-pending',
    downloadUrl: '#download-pending',
    bilibiliUrl: 'https://www.bilibili.com/video/BV11DX7BdE9w',
    status: 'Bilibili demo',
  },
  {
    id: 'five-second-real-man',
    number: '03',
    archiveCode: 'WORK-03',
    title: '五秒真男人',
    type: '游戏项目 / 作品记录',
    summary: '《五秒真男人》游戏项目。完整演示可在 B 站观看；本地项目视频待补充。',
    image: '/media/placeholders/archive-black.svg',
    videoUrl: '#video-pending',
    downloadUrl: '#download-pending',
    bilibiliUrl: 'https://www.bilibili.com/video/BV12dNT61EMR',
    status: 'Bilibili demo',
  },
  {
    id: 'work-04-redacted', number: '04', archiveCode: 'WORK-04', title: 'ARCHIVE / REDACTED', type: 'GAME / MATERIAL LOCKED',
    summary: '████████ ████████ ████████', image: '/media/placeholders/archive-black.svg', videoUrl: '', downloadUrl: '', bilibiliUrl: '', status: 'Material pending', pending: true,
  },
  {
    id: 'work-05-redacted', number: '05', archiveCode: 'WORK-05', title: 'ARCHIVE / REDACTED', type: 'GAME / MATERIAL LOCKED',
    summary: '████████ ████████ ████████', image: '/media/placeholders/archive-black.svg', videoUrl: '', downloadUrl: '', bilibiliUrl: '', status: 'Material pending', pending: true,
  },
  ...Array.from({ length: 6 }, (_, index) => {
    const number = index + 6;
    return { id: `work-${String(number).padStart(2, '0')}-redacted`, number: String(number).padStart(2, '0'), archiveCode: `WORK-${String(number).padStart(2, '0')}`, title: 'ARCHIVE / REDACTED', type: 'GAME / MATERIAL LOCKED', summary: '████████ ████████ ████████', image: '/media/placeholders/archive-black.svg', videoUrl: '', downloadUrl: '', bilibiliUrl: '', status: 'Material pending', pending: true };
  }),
];

const archiveCover = (title, code) => {
  const safeTitle = title.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" fill="#151916"/><circle cx="400" cy="400" r="304" fill="none" stroke="#d8ff4f" stroke-width="3"/><circle cx="400" cy="400" r="238" fill="none" stroke="#3b423d" stroke-width="38"/><circle cx="400" cy="400" r="128" fill="#eef0e7"/><circle cx="400" cy="400" r="18" fill="#151916"/><path d="M80 110h640M80 690h640" stroke="#d8ff4f" stroke-width="3"/><text x="80" y="70" fill="#d8ff4f" font-family="monospace" font-size="24">HAOQI / STUDIO</text><text x="80" y="745" fill="#eef0e7" font-family="monospace" font-size="23">${code} / ARCHIVE EDITION</text><text x="400" y="375" fill="#151916" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="30">${safeTitle}</text></svg>`)}`;
};
const importedAlbum = ({ id, code, folder, title, tracks }) => ({
  id, archiveCode: code, title, mood: 'LOCAL COLLECTION / LRC ARCHIVED',
  analysis: `《${title}》本地专辑档案。歌词 LRC 已随曲目关联，可在后续播放器界面继续扩展显示。`,
  image: archiveCover(title, code),
  tracks: tracks.map(([artist, track], index) => {
    const file = `${artist} - ${track}`;
    return { id: `${id}-${String(index + 1).padStart(2, '0')}`, title: track, artist, src: `${folder}/${file}.mp3`, lrc: id === 'sound-04-no-title' && track === 'Echo' ? '' : `${folder}/${file}.lrc` };
  }),
});
const emptyMusicSlots = Array.from({ length: 6 }, (_, index) => {
  const number = index + 6;
  return { id: `sound-${String(number).padStart(2, '0')}-redacted`, archiveCode: `SOUND-${String(number).padStart(2, '0')}`, title: 'ARCHIVE / REDACTED', mood: 'SOUND / MATERIAL LOCKED', analysis: '████████ ████████ ████████', image: '/media/placeholders/archive-black.svg', pending: true, tracks: [] };
});

export const musicTracks = [
  {
    id: 'sound-01-ost',
    archiveCode: 'SOUND-01',
    title: '众生行记 OST',
    mood: '塞壬唱片-MSR / Original Soundtrack',
    analysis: '《众生行记 OST》完整曲目档案。选择曲目后将在全站播放器中持续播放。',
    image: '/media/music/sound-01-somniomancer-null-set/cover.jpg',
    tracks: [
      { id: 'sound-01-underneath-sanctuary', title: 'Underneath the Sanctuary', artist: '塞壬唱片-MSR, Adam Gubman', src: '/media/music/sound-01-somniomancer-null-set/塞壬唱片-MSR,Adam Gubman - Underneath the Sanctuary.mp3' },
      { id: 'sound-01-touch-law', title: 'Touch of the Law', artist: '塞壬唱片-MSR, Alec Justice, Echos', src: '/media/music/sound-01-somniomancer-null-set/塞壬唱片-MSR,Alec Justice,Echos - Touch of the Law.mp3' },
      { id: 'sound-01-the-birth', title: 'The Birth', artist: '塞壬唱片-MSR, BaoUner', src: '/media/music/sound-01-somniomancer-null-set/塞壬唱片-MSR,BaoUner - The Birth.mp3' },
      { id: 'sound-01-the-pilgrimage', title: 'The Pilgrimage', artist: '塞壬唱片-MSR, BaoUner', src: '/media/music/sound-01-somniomancer-null-set/塞壬唱片-MSR,BaoUner - The Pilgrimage.mp3' },
      { id: 'sound-01-somniomancer', title: 'Somniomancer [null set]', artist: '塞壬唱片-MSR, Crywolf', src: '/media/music/sound-01-somniomancer-null-set/塞壬唱片-MSR,Crywolf - Somniomancer [null set].mp3' },
      { id: 'sound-01-faith-enlightenment', title: 'Faith Enlightenment', artist: '塞壬唱片-MSR, Erik Castro, Robert Wolf', src: '/media/music/sound-01-somniomancer-null-set/塞壬唱片-MSR,Erik Castro,Robert Wolf - Faith Enlightenment.mp3' },
    ],
  },
  importedAlbum({ id: 'sound-02-zelda', code: 'SOUND-02', title: 'ゼルダの伝説 ブレス オブ ザ ワイルド SOUND SELECTION', folder: '/media/music/sound-02-redacted/ゼルダの伝説 ブレス オブ ザ ワイルド SOUND SELECTION', tracks: [
    ['片岡真央', '襲歩 (夜)'], ['片岡真央', '襲歩 (昼)'], ['片岡真央', '戦闘 (祠)'], ['片岡真央', '戦闘 (フィールド)'], ['片岡真央', 'イワロック戦'], ['片岡真央', 'ガーディアン戦'], ['片岡真央', 'フィールド (昼)'], ['片岡真央', 'メインテーマ'], ['若井淑', 'カカリコ村 (夜)'], ['若井淑', 'カカリコ村 (昼)'], ['若井淑', 'ヒノックス戦'], ['岩田恭明', '祠'], ['岩田恭明', '馬宿'], ['岩田恭明', '時の神殿'], ['岩田恭明', 'カッシーワのテーマ'], ['岩田恭明', 'ゲルドの街 (夜)'], ['岩田恭明', 'ゲルドの街 (昼)'], ['岩田恭明', 'ゴロンシティー (夜)'], ['岩田恭明', 'ゴロンシティー (昼)'], ['岩田恭明', 'ゾーラの (夜)'], ['岩田恭明', 'ゾーラの (昼)'], ['岩田恭明', 'リトの村 (夜)'], ['岩田恭明', 'リトの村 (昼)'], ['竹岡智行', 'メインテーマ コンサートバージョン'],
  ] }),
  importedAlbum({ id: 'sound-03-huaishu-li', code: 'SOUND-03', title: '怀黍离OST', folder: '/media/music/sound-03-redacted/怀黍离OST', tracks: [
    ['塞壬唱片-MSR,颜沐宸Ace', '击壤歌'], ['塞壬唱片-MSR,KH', '锦绣山河'], ['塞壬唱片-MSR,Kirara Magic', '赴大荒'], ['塞壬唱片-MSR,Salty Salt,Elvin Shen', '祥风时雨'],
  ] }),
  importedAlbum({ id: 'sound-04-no-title', code: 'SOUND-04', title: 'No title-', folder: '/media/music/sound-04-redacted/No title-', tracks: [
    ['Reol', '-BWW SCREAM-'], ['Reol', '-Ending-'], ['Reol', '-Interlude-'], ['Reol', '-Opening-'], ['Reol', 'Echo'], ['Reol', 'アシンメトリー'], ['Reol', 'ギガンティックO.T.N -Big Death Edition-'], ['Reol', 'ヒビカセ'], ['Reol,Giga', 'drop pop candy'], ['Reol,Giga', 'No title'], ['Reol,nqrse', 'オオエドランヴ'],
  ] }),
  importedAlbum({ id: 'sound-05-panty-stocking', code: 'SOUND-05', title: 'Panty & Stocking with Garterbelt The Original Soundtrack', folder: '/media/music/sound-05-redacted/Panty & Stocking with Garterbelt The Original Soundtrack', tracks: [
    ['Aimee b,☆Taku Takahashi', 'Fallen Angel'], ['Hoshina Anniversary', 'Theme for Panty & Stocking'], ['Mariya Ise,TCY FORCE', 'CHOCOLAT'], ['TeddyLoid', 'Theme for Scanty & Knee Socks'],
  ] }),
  ...emptyMusicSlots,
];

export const photoAlbums = [
  {
    id: 'yangshuo-2026-08-27',
    number: '01',
    archiveCode: 'PHOTO-01',
    title: '阳朔 / 2026.08.27',
    city: '广西 · 桂林 · 阳朔',
    year: '2026',
    date: '2026.08.27',
    frameCount: 1,
    camera: 'Camera / Pending',
    cover: '/media/photos/2026-08-27-guangxi-guilin-yangshuo/01.png',
    summary: '2026 年 8 月 27 日摄于广西桂林阳朔。',
    coordinates: { x: 57, y: 73 },
    tags: ['广西', '桂林', '阳朔', '2026.08.27'],
    images: [
      { src: '/media/photos/2026-08-27-guangxi-guilin-yangshuo/01.png', caption: '阳朔 / 2026.08.27' },
    ],
  },
  {
    id: 'photo-02-redacted',
    number: '02',
    archiveCode: 'PHOTO-02',
    title: 'ARCHIVE / REDACTED',
    city: '待接入',
    year: '----',
    date: '----.--.--',
    frameCount: 0,
    camera: 'MATERIAL LOCKED',
    cover: '/media/placeholders/archive-black.svg',
    summary: '████████ ████████ ████████',
    coordinates: { x: 61, y: 78 },
    tags: ['MATERIAL LOCKED'],
    images: [
      { src: '/media/placeholders/archive-black.svg', caption: 'ARCHIVE / REDACTED' },
    ],
  },
  {
    id: 'photo-03-redacted',
    number: '03',
    archiveCode: 'PHOTO-03',
    title: 'ARCHIVE / REDACTED',
    city: '待接入',
    year: '----',
    date: '----.--.--',
    frameCount: 0,
    camera: 'MATERIAL LOCKED',
    cover: '/media/placeholders/archive-black.svg',
    summary: '████████ ████████ ████████',
    coordinates: { x: 75, y: 55 },
    tags: ['MATERIAL LOCKED'],
    images: [
      { src: '/media/placeholders/archive-black.svg', caption: 'ARCHIVE / REDACTED' },
    ],
  },
  {
    id: 'photo-04-redacted', number: '04', archiveCode: 'PHOTO-04', title: 'ARCHIVE / REDACTED', city: '待接入', year: '----', date: '----.--.--', frameCount: 0, camera: 'MATERIAL LOCKED', cover: '/media/placeholders/archive-black.svg', summary: '████████ ████████ ████████', coordinates: { x: 62, y: 32 }, tags: ['MATERIAL LOCKED'], images: [{ src: '/media/placeholders/archive-black.svg', caption: 'ARCHIVE / REDACTED' }], pending: true,
  },
  {
    id: 'photo-05-redacted', number: '05', archiveCode: 'PHOTO-05', title: 'ARCHIVE / REDACTED', city: '待接入', year: '----', date: '----.--.--', frameCount: 0, camera: 'MATERIAL LOCKED', cover: '/media/placeholders/archive-black.svg', summary: '████████ ████████ ████████', coordinates: { x: 62, y: 32 }, tags: ['MATERIAL LOCKED'], images: [{ src: '/media/placeholders/archive-black.svg', caption: 'ARCHIVE / REDACTED' }], pending: true,
  },
  ...Array.from({ length: 6 }, (_, index) => {
    const number = index + 6;
    const archiveCode = `PHOTO-${String(number).padStart(2, '0')}`;
    return { id: `photo-${String(number).padStart(2, '0')}-redacted`, number: String(number).padStart(2, '0'), archiveCode, title: 'ARCHIVE / REDACTED', city: '待接入', year: '----', date: '----.--.--', frameCount: 0, camera: 'MATERIAL LOCKED', cover: '/media/placeholders/archive-black.svg', summary: '████████ ████████ ████████', coordinates: { x: 62, y: 32 }, tags: ['MATERIAL LOCKED'], images: [{ src: '/media/placeholders/archive-black.svg', caption: 'ARCHIVE / REDACTED' }], pending: true };
  }),
];

export const mapCities = [
  { city: '阳朔', x: 57, y: 73, count: 1 },
  { city: '待接入', x: 62, y: 32, count: 4 },
  { city: '北京', x: 62, y: 32, count: 0 },
];
