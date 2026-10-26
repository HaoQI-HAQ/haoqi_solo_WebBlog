import React from 'react';
import { mediaBase } from '../content.deploy.js';
import './about-interests.css';

const image = path => `${mediaBase}${path}`;
const photo = new URL('./panorama.webp', import.meta.url).href;
const content = {
  mixed: {
    hello: '你好，我是浩祈。', intro: '游戏策划、视觉设计，也是一名 AI 编曲人。',
    rows: [
      { title: '把想法做成游戏', tags: ['游戏策划', '玩法与叙事'], body: '从规则、选择到关卡节奏，探索一个世界如何成为可游玩的体验。', caption: '泡涌 · 我的游戏作品', link: '看看我做的游戏' },
      { title: '用镜头收藏路过的世界', tags: ['摄影', '光线与地点'], body: '在山与河、光与影之间，留下一段真实行走的记忆。', caption: '阳朔 · 2026.08.27', link: '翻开我的摄影画册' },
      { title: '在声音里寻找情绪', tags: ['AI 编曲', '音乐收藏'], body: '聆听旋律、编排与声音叙事，也让音乐成为理解一个作品的入口。', caption: 'Luv(sic) Hexalogy · Nujabes feat. Shing02', link: '进入私人聆听室' },
    ],
  },
  en: {
    hello: 'Hello, I’m Haoqi.', intro: 'Game design, visual design and AI composition.',
    rows: [
      { title: 'Making ideas playable', tags: ['Game design', 'Rules & stories'], body: 'Exploring how rules, choices and the rhythm of a level turn a world into a playable experience.', caption: 'Paoyong · My game work', link: 'Explore my game work' },
      { title: 'Keeping the world I pass through', tags: ['Photography', 'Light & place'], body: 'Mountains, rivers, light and shadow: fragments of a real journey.', caption: 'Yangshuo · 2026.08.27', link: 'Open my photo journal' },
      { title: 'Finding feeling in sound', tags: ['AI composition', 'Music collection'], body: 'Listening to melody, arrangement and narrative as another way into a work.', caption: 'Luv(sic) Hexalogy · Nujabes feat. Shing02', link: 'Enter the listening room' },
    ],
  },
  ja: {
    hello: 'こんにちは、HAOQI です。', intro: 'ゲームデザイン、ビジュアル、そして AI 作曲。',
    rows: [
      { title: '発想を、遊べる形へ', tags: ['ゲームデザイン', 'ルールと物語'], body: 'ルール、選択、レベルのリズムから、世界を遊べる体験にする方法を探ります。', caption: '泡涌 · ゲーム作品', link: 'ゲーム作品を見る' },
      { title: '通り過ぎた世界を残す', tags: ['写真', '光と場所'], body: '山と川、光と影のあいだに、実際に歩いた旅の記憶を残しています。', caption: '陽朔 · 2026.08.27', link: '写真を見る' },
      { title: '音のなかに感情を探す', tags: ['AI 作曲', '音楽コレクション'], body: '旋律、編曲、音の物語を聴くことも、作品を理解する入口です。', caption: 'Luv(sic) Hexalogy · Nujabes feat. Shing02', link: 'リスニングルームへ' },
    ],
  },
  ru: {
    hello: 'Привет, я Haoqi.', intro: 'Игровой дизайн, визуальный дизайн и AI-музыка.',
    rows: [
      { title: 'Превращаю идеи в игры', tags: ['Игровой дизайн', 'Правила и истории'], body: 'Исследую, как правила, выбор и ритм уровня превращают мир в игровой опыт.', caption: '泡涌 · Мой игровой проект', link: 'Посмотреть мои игры' },
      { title: 'Сохраняю мир в кадре', tags: ['Фотография', 'Свет и место'], body: 'Горы и реки, свет и тень — фрагменты настоящего путешествия.', caption: 'Яншо · 2026.08.27', link: 'Открыть фотоальбом' },
      { title: 'Ищу эмоции в звуке', tags: ['AI-музыка', 'Музыкальная коллекция'], body: 'Мелодия, аранжировка и звуковое повествование помогают понять произведение.', caption: 'Luv(sic) Hexalogy · Nujabes feat. Shing02', link: 'В комнату прослушивания' },
    ],
  },
};
const visuals = [
  { kind: 'game', src: image('/media/games/work-04-paoyong/promotion-landscape.webp'), href: '/work.html', width: 1672, height: 941 },
  { kind: 'photo', src: photo, href: '/photography.html', width: 1920, height: 780 },
  { kind: 'music', src: image('/media/work-archive/covers/sound-06.webp'), href: '/music.html', width: 512, height: 512 },
];

function InterestIcon({ kind }) {
  return <svg className="ai-interest-icon" viewBox="0 0 80 80" fill="none" aria-hidden="true">{kind === 'game' ? <><path d="M23 25h34c8 0 15 25 11 31-4 5-13-2-18-8H30c-5 6-14 13-18 8-4-6 3-31 11-31Z" /><path d="M23 35v14m-7-7h14" /><circle cx="54" cy="36" r="2" /><circle cx="61" cy="44" r="2" /></> : kind === 'photo' ? <><rect x="10" y="25" width="60" height="40" rx="6" /><path d="m24 25 5-10h22l5 10" /><circle cx="40" cy="45" r="13" /><path d="M59 32h3" /></> : <><circle cx="40" cy="40" r="29" /><circle cx="40" cy="40" r="10" /><circle cx="40" cy="40" r="2" /><path d="M19 40a21 21 0 0 1 21-21m0 42a21 21 0 0 0 21-21" /></>}</svg>;
}

export default function AboutInterests({ language = 'mixed' }) {
  const t = content[language] || content.mixed;
  const quick = ({en:['Favorite games','Game library'],ja:['お気に入り','ゲームライブラリ'],ru:['Любимые игры','Библиотека игр']})[language] || ['最爱的游戏','我的游戏库'];
  return <>
    <header className="ai-hello" data-enter="title"><h1>{t.hello}</h1><p>{t.intro}</p><div className="ai-quick-links"><a href="#about-favorites">{quick[0]}</a><a href="#about-library">{quick[1]}</a></div></header>
    <div className="ai-interests">
      {t.rows.map((row, index) => <section className={`ai-interest ai-interest-kind-${visuals[index].kind}`} key={visuals[index].kind}>
        <div className="ai-interest-copy" data-enter="copy">
          <InterestIcon kind={visuals[index].kind} />
          <div><h2>{row.title}</h2><ul className="ai-interest-tags">{row.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><p>{row.body}</p><a href={visuals[index].href}>{row.link}<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></a></div>
        </div>
        <figure className="ai-interest-photo" data-enter="media"><img src={visuals[index].src} width={visuals[index].width} height={visuals[index].height} alt={row.caption} loading={index === 0 ? 'eager' : 'lazy'} /><figcaption>{row.caption}</figcaption></figure>
      </section>)}
    </div>
  </>;
}
