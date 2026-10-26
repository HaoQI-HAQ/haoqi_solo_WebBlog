const zh = {
  photography: '摄影作品', photoIntro: '把路过的地方，留在这里。', photoTitle: '阳朔',
  photoAlt: '广西桂林阳朔相公山的山峰、江流与日落全景', fullAlt: '阳朔相公山全景原图',
  expandLabel: '放大查看阳朔全景', expand: '展开全景', original: '查看原图', albums: '摄影相册',
  close: '关闭', closeOriginal: '关闭原图', newTab: '在新标签页查看原图',
  music: '音乐收藏', musicIntro: '私人聆听室', cover: '专辑封面', playAlbum: '播放专辑',
  pausePlayback: '暂停播放', trackCount: count => `${count} 首曲目`, tracks: '曲目', play: '播放', pause: '暂停',
  controls: '音乐播放控制', choose: '选择一首歌，开始聆听。', collectionNote: '个人音乐收藏 · 第三方唱片',
  previous: '上一首', next: '下一首', progress: '播放进度', loading: '正在加载音频…',
  playbackError: '音频未能加载，请重试或选择其他曲目。', retry: '重试播放',
  collection: '我的音乐收藏', collectionIntro: count => `${count} 张唱片，随时切换。`, viewAlbum: '查看专辑',
};

const en = {
  photography: 'Photography', photoIntro: 'Places passed through, kept here.', photoTitle: 'Yangshuo',
  photoAlt: 'Sunset over the karst peaks and river at Xianggong Mountain in Yangshuo, Guangxi',
  fullAlt: 'Original panorama of Xianggong Mountain, Yangshuo', expandLabel: 'Enlarge the Yangshuo panorama',
  expand: 'Expand panorama', original: 'View original', albums: 'Photo albums', close: 'Close',
  closeOriginal: 'Close original photograph', newTab: 'Open original in a new tab',
  music: 'Music', musicIntro: 'A private listening room', cover: 'Album cover', playAlbum: 'Play album',
  pausePlayback: 'Pause playback', trackCount: count => `${count} tracks`, tracks: 'Tracks', play: 'Play', pause: 'Pause',
  controls: 'Music playback controls', choose: 'Choose a track and settle in.', collectionNote: 'Personal music collection · Third-party records',
  previous: 'Previous track', next: 'Next track', progress: 'Playback position', loading: 'Loading audio…',
  playbackError: 'This track could not load. Retry or choose another track.', retry: 'Retry playback',
  collection: 'My record collection', collectionIntro: count => `${count} records, ready to explore.`, viewAlbum: 'View album',
};

const ja = {
  photography: '写真', photoIntro: '通り過ぎた場所を、ここに残す。', photoTitle: '陽朔',
  photoAlt: '中国・広西桂林陽朔の相公山から望む山々、川、夕焼けのパノラマ', fullAlt: '陽朔・相公山のパノラマ原寸画像',
  expandLabel: '陽朔のパノラマを拡大', expand: 'パノラマを広げる', original: '原寸で見る', albums: '写真アルバム',
  close: '閉じる', closeOriginal: '原寸画像を閉じる', newTab: '新しいタブで原寸画像を開く',
  music: '音楽', musicIntro: 'プライベート・リスニングルーム', cover: 'アルバムジャケット', playAlbum: 'アルバムを再生',
  pausePlayback: '一時停止', trackCount: count => `${count} 曲`, tracks: '収録曲', play: '再生', pause: '一時停止',
  controls: '音楽の再生操作', choose: '一曲選んで、聴きはじめる。', collectionNote: '個人音楽コレクション · 他者制作のレコード',
  previous: '前の曲', next: '次の曲', progress: '再生位置', loading: '音声を読み込み中…',
  playbackError: '曲を読み込めませんでした。再試行するか別の曲を選んでください。', retry: '再生を再試行',
  collection: 'レコードコレクション', collectionIntro: count => `${count} 枚のレコードを自由に。`, viewAlbum: 'アルバムを見る',
};

const ru = {
  photography: 'Фотография', photoIntro: 'Места, где я побывал, остаются здесь.', photoTitle: 'Яншо',
  photoAlt: 'Закат над горами и рекой у горы Сянгун в Яншо, Гуанси', fullAlt: 'Оригинальная панорама Яншо с горы Сянгун',
  expandLabel: 'Увеличить панораму Яншо', expand: 'Развернуть панораму', original: 'Открыть оригинал', albums: 'Фотоальбомы',
  close: 'Закрыть', closeOriginal: 'Закрыть оригинал', newTab: 'Открыть оригинал в новой вкладке',
  music: 'Музыка', musicIntro: 'Личная комната для музыки', cover: 'Обложка альбома', playAlbum: 'Слушать альбом',
  pausePlayback: 'Пауза', trackCount: count => `Треков: ${count}`, tracks: 'Треки', play: 'Воспроизвести', pause: 'Пауза',
  controls: 'Управление воспроизведением', choose: 'Выберите трек и начните слушать.', collectionNote: 'Личная коллекция · Записи других авторов',
  previous: 'Предыдущий трек', next: 'Следующий трек', progress: 'Позиция воспроизведения', loading: 'Загрузка аудио…',
  playbackError: 'Не удалось загрузить трек. Повторите попытку или выберите другой.', retry: 'Повторить',
  collection: 'Моя коллекция записей', collectionIntro: count => `В коллекции ${count} альбомов.`, viewAlbum: 'Открыть альбом',
};

const copy = { mixed: { ...zh, photography: 'Photography', music: 'Music' }, zh, en, ja, ru };
export const photoMusicCopy = language => copy[language] || copy.mixed;
