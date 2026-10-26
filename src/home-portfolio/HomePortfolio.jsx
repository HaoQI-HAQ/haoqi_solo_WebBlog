import { useState } from 'react';
import { gameWorks, musicTracks, photoAlbums } from '../content.deploy.js';
import GameProject from '../game-project/GameProject.jsx';
import ArcadeInvaders from '../arcade/ArcadeInvaders.jsx';
import './home-portfolio.css';

export const homeCopy = {
  mixed: {
    title: 'Play, image<br /><em>&amp; sound.</em>', intro: '我是浩祈，一名游戏策划、视觉设计师，也是一名 AI 编曲人。',
    scroll: '向下，进入作品集', workNote: '从游戏里的世界，到镜头里的片刻，再到耳机里的声音。',
    games: '游戏作品', photos: '摄影作品', music: '音乐收藏', demo: '观看演示', allWorks: '探索完整作品档案',
    photoNote: '把旅途中值得停下来的片刻，留在这里。', allPhotos: '进入摄影档案',
    musicNote: '创作之外，也记录那些值得反复聆听的声音。', allMusic: '浏览音乐收藏', listen: '播放首曲',
    contact: 'Let’s make<br /><em>a world.</em>',
  },
  zh: {
    title: '游戏、影像<br /><em>与声音。</em>', intro: '我是浩祈，一名游戏策划、视觉设计师，也是一名 AI 编曲人。',
    scroll: '向下，进入作品集', workNote: '从游戏里的世界，到镜头里的片刻，再到耳机里的声音。',
    games: '游戏作品', photos: '摄影作品', music: '音乐收藏', demo: '观看演示', allWorks: '探索完整作品档案',
    photoNote: '把旅途中值得停下来的片刻，留在这里。', allPhotos: '进入摄影档案',
    musicNote: '创作之外，也记录那些值得反复聆听的声音。', allMusic: '浏览音乐收藏', listen: '播放首曲',
    contact: '一起，做个<br /><em>新的世界。</em>',
  },
  en: {
    title: 'Play, image<br /><em>&amp; sound.</em>', intro: 'I’m Haoqi, a game designer, visual designer and AI composer.',
    scroll: 'Scroll into the work', workNote: 'Worlds to play. Moments to look at. Sounds to return to.',
    games: 'Game works', photos: 'Photography', music: 'Music collection', demo: 'Watch demo', allWorks: 'Explore the full archive',
    photoNote: 'Moments along the way that made me stop and look.', allPhotos: 'Explore photography',
    musicNote: 'Beyond making things, a collection of sounds worth returning to.', allMusic: 'Explore the collection', listen: 'Play first track',
    contact: 'Let’s make<br /><em>a world.</em>',
  },
  ja: {
    title: '遊び、映像、<br /><em>そして音。</em>', intro: 'HAOQIです。ゲームデザイン、ビジュアル、AI 作曲を横断して制作しています。',
    scroll: '下へ、作品を見る', workNote: '遊べる世界から、写真の一瞬、繰り返し聴く音まで。',
    games: 'ゲーム作品', photos: '写真', music: '音楽コレクション', demo: '映像を見る', allWorks: '作品アーカイブへ',
    photoNote: '旅の途中で、足を止めたくなった瞬間を。', allPhotos: '写真アーカイブへ',
    musicNote: '制作の傍らで、何度も聴きたくなる音を集めています。', allMusic: '音楽コレクションへ', listen: '最初の曲を再生',
    contact: '一緒に、<br /><em>新しい世界を。</em>',
  },
  ru: {
    title: 'Игра, образ<br /><em>и звук.</em>', intro: 'Я Haoqi — игровой и визуальный дизайнер, AI-композитор.',
    scroll: 'Листайте к работам', workNote: 'Игровые миры, мгновения в кадре и музыка, к которой возвращаешься.',
    games: 'Игровые работы', photos: 'Фотография', music: 'Музыкальная коллекция', demo: 'Смотреть демо', allWorks: 'Весь архив работ',
    photoNote: 'Мгновения в пути, ради которых хочется остановиться.', allPhotos: 'Фотоархив',
    musicNote: 'Музыка, к которой хочется возвращаться между собственными проектами.', allMusic: 'Вся коллекция', listen: 'Первый трек',
    contact: 'Создадим<br /><em>новый мир.</em>',
  },
};

const publishedGames = gameWorks.filter((work) => !work.pending);
const publishedPhotos = photoAlbums.filter((album) => !album.pending);
const publishedMusic = musicTracks.filter((album) => !album.pending && album.tracks?.some((track) => track.src));

function Arrow({ down = false }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={down ? 'M12 4v16m-6-6 6 6 6-6' : 'M5 19 19 5M5 5h14v14'} /></svg>;
}

export default function HomePortfolio({ language, selectedTitle, onOpenArchive }) {
  const copy = homeCopy[language] || homeCopy.mixed;
  const [selectedAlbumId, setSelectedAlbumId] = useState(publishedMusic[0]?.id);
  const featuredAlbum = publishedMusic[0];
  const photo = publishedPhotos[0];
  const counts = [publishedGames.length, publishedPhotos.length, publishedMusic.length];

  const playAlbum = (album) => {
    const track = album.tracks.find((item) => item.src);
    if (!track) return;
    setSelectedAlbumId(album.id);
    window.dispatchEvent(new CustomEvent('haoqi-play-track', { detail: { trackId: track.id } }));
  };

  return <>
    <ArcadeInvaders language={language} />
    <section id="work" className="home-work section-light" aria-labelledby="home-work-title">
      <div className="page-width">
        <div className="home-section-heading">
          <h2 id="home-work-title">{selectedTitle}</h2>
          <p>{copy.workNote}</p>
        </div>
        <nav className="home-portfolio-index" aria-label={selectedTitle}>
          {[['work', copy.games], ['photo', copy.photos], ['music', copy.music]].map(([id, label], index) =>
              <a href={`#${id}`} key={id}><span>{label}</span><span className="home-index-count">{counts[index]}</span><Arrow down /></a>,
          )}
        </nav>
        <div className="home-game-list">
          {publishedGames.map((work) => work.gallery?.length ? <article className="home-game-feature" key={work.id}>
            <span className="home-game-code">{work.archiveCode}</span>
            <GameProject work={work} language={language} showTitle />
          </article> : <a className="home-game" href={work.bilibiliUrl || '/work.html'} target={work.bilibiliUrl ? '_blank' : undefined} rel={work.bilibiliUrl ? 'noreferrer' : undefined} key={work.id}>
            <span className="home-game-code">{work.archiveCode}</span>
            <h3>{work.title}</h3>
            <span className="home-game-type">{work.type}</span>
            <span className="home-game-action">{work.bilibiliUrl ? copy.demo : copy.allWorks}<Arrow /></span>
          </a>)}
        </div>
        <a className="home-text-link" href="/work.html">{copy.allWorks}<Arrow /></a>
      </div>
    </section>

    <section id="photo" className="home-photo section-light" aria-labelledby="home-photo-title">
      <div className="page-width home-photo-layout">
        <div className="home-photo-copy">
          <h2 id="home-photo-title">{copy.photos}</h2>
          <p>{copy.photoNote}</p>
          {photo && <div className="home-photo-caption"><h3>{photo.city}</h3><p>{photo.date}</p></div>}
          <a className="home-text-link" href="/photography.html">{copy.allPhotos}<Arrow /></a>
        </div>
        {photo && <button type="button" className="home-photo-image" onClick={(event) => onOpenArchive('photo', photo, event)} aria-label={photo.title}>
          <img src={photo.cover} alt={photo.title} loading="lazy" decoding="async" width="1600" height="1200" />
          <span className="home-photo-open"><Arrow /></span>
        </button>}
      </div>
    </section>

    <section id="music" className="home-music section-dark" aria-labelledby="home-music-title">
      <div className="page-width">
        <div className="home-section-heading"><h2 id="home-music-title">{copy.music}</h2><p>{copy.musicNote}</p></div>
        <div className="home-music-layout">
          {featuredAlbum && <div className="home-record">
            <img src={featuredAlbum.image} alt={featuredAlbum.title} loading="lazy" decoding="async" width="640" height="640" />
            <div><span>{featuredAlbum.archiveCode}</span><h3>{featuredAlbum.title}</h3><button className="home-text-link" type="button" data-site-sound="ui-tick" onClick={() => playAlbum(featuredAlbum)}>{copy.listen}<Arrow /></button></div>
          </div>}
          <div className="home-album-list">
            {publishedMusic.slice(0, 4).map((album) => <button className={`home-album ${selectedAlbumId === album.id ? 'is-selected' : ''}`} type="button" data-site-sound="ui-tick" onClick={() => playAlbum(album)} key={album.id} aria-label={`${copy.listen}: ${album.title}`}>
              <span className="home-album-code">{album.archiveCode}</span><span className="home-album-title">{album.title}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" fill="currentColor" /></svg>
            </button>)}
            <a className="home-text-link" href="/music.html">{copy.allMusic}<Arrow /></a>
          </div>
        </div>
      </div>
    </section>
  </>;
}
