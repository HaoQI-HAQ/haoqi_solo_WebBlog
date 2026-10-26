import React, { useId, useMemo, useState } from 'react';
import { favoriteGames, favoriteIds as storedFavoriteIds, gameLibrary, gameCollectionInfo } from '../content.games.js';
import { mediaBase } from '../content.deploy.js';
import { gameCollectionCopy } from './game-collection-copy.js';
import './game-collection.css';

const clean = value => typeof value === 'string' ? value.trim() : '';
const keyOf = value => clean(value).toLocaleLowerCase();
const tagsOf = game => [...new Set((Array.isArray(game.tags) ? game.tags : []).map(clean).filter(Boolean))];
const tagLabel = (tag, copy) => copy.tags[keyOf(tag)] || tag;
const localized = (value, language) => typeof value === 'string' ? value : value?.[language] || value?.zh || value?.mixed || value?.en || '';

function uniqueGames(games) {
  const seen = new Set();
  return (Array.isArray(games) ? games : []).filter(game => {
    if (!game || typeof game !== 'object' || !clean(game.id) || !clean(game.title) || seen.has(game.id)) return false;
    seen.add(game.id);
    return true;
  });
}

function officialUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function Star() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.4l6.3-.9Z" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4 4" /></svg>;
}

function SizeControl({ value, onChange, min, max, copy, label }) {
  const id = useId();
  return <div className="gc-size-control">
    <label htmlFor={id}>{copy.size}<span className="gc-sr-only"> — {label}</span></label>
    <input id={id} type="range" min={min} max={max} step="10" value={value} onChange={event => onChange(Number(event.target.value))} aria-valuetext={copy.sizeValue(value)} />
    <output htmlFor={id} aria-hidden="true">{value}</output>
  </div>;
}

function GameCard({ game, favorite, featured = false, language, copy }) {
  const [failedCover, setFailedCover] = useState('');
  const original = clean(game.title);
  const english = clean(game.titleEn);
  const title = language === 'en' && english ? english : original;
  const secondary = title === english ? original : english;
  const note = localized(game.note, language);
  const source = clean(game.cover);
  const cover = source.startsWith('/media/') ? `${mediaBase}${source}` : source;
  const href = officialUrl(game.storeUrl);
  const Cover = href ? 'a' : 'div';
  const tags = tagsOf(game);

  return <article className={`gc-game${featured ? ' gc-game-featured' : ''}`} data-game-id={game.id}>
    <Cover className="gc-cover" {...(href ? { href, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${favorite ? `${copy.favoriteLabel}. ` : ''}${copy.viewGame(title)}` } : {})}>
      {cover && failedCover !== cover
        ? <img src={cover} alt={href ? '' : copy.coverAlt(title)} width="400" height="600" style={{objectPosition:game.coverPosition || 'center',objectFit:game.coverFit || 'cover'}} loading="lazy" decoding="async" onError={() => setFailedCover(cover)} />
        : <div className="gc-cover-text" aria-hidden={href ? true : undefined}><span>{title}</span></div>}
      {favorite && <span className="gc-favorite-mark" role="img" aria-label={copy.favoriteLabel}><Star /></span>}
    </Cover>
    <h4 className="gc-game-title">{title}</h4>
    {featured && secondary && secondary !== title && <p className="gc-game-secondary" lang={title === english ? 'zh' : 'en'}>{secondary}</p>}
    {featured && note && <p className="gc-game-note">{note}</p>}
    {tags.length > 0 && (!featured || !note) && <p className="gc-game-tags">{tags.map(tag => tagLabel(tag, copy)).join(' / ')}</p>}
  </article>;
}

/**
 * About-only game shelves. Production defaults contain no inferred preferences.
 * Tests/previews can inject games, favorites (ids or records), and favoriteIds.
 */
export function GameCollection({ language = 'mixed', motion = true, games = gameLibrary, favorites = favoriteGames, favoriteIds = storedFavoriteIds, collectionMeta = gameCollectionInfo }) {
  const copy = gameCollectionCopy[language] || gameCollectionCopy.mixed;
  const id = useId();
  const [favoriteSize, setFavoriteSize] = useState(240);
  const [librarySize, setLibrarySize] = useState(180);
  const [selectedTags, setSelectedTags] = useState([]);
  const [query, setQuery] = useState('');
  const library = useMemo(() => uniqueGames(games), [games]);
  const loved = useMemo(() => {
    const lookup = new Map(library.map(game => [game.id, game]));
    const entries = Array.isArray(favorites) ? favorites : [];
    const ids = Array.isArray(favoriteIds) ? favoriteIds : [];
    return uniqueGames([
      ...entries.map(entry => typeof entry === 'string' ? lookup.get(entry) : entry && { ...lookup.get(entry.id), ...entry }),
      ...ids.map(gameId => lookup.get(gameId)),
    ]);
  }, [library, favorites, favoriteIds]);
  const favoriteSet = useMemo(() => new Set(loved.map(game => game.id)), [loved]);
  const genres = useMemo(() => {
    const distinct = new Map();
    library.forEach(game => tagsOf(game).forEach(tag => {
      if (!distinct.has(keyOf(tag))) distinct.set(keyOf(tag), tag);
    }));
    return [...distinct.entries()];
  }, [library]);
  // A supplied collection may change without remounting the About page.
  const activeTags = selectedTags.filter(tag => genres.some(([key]) => key === tag));
  const normalizedQuery = keyOf(query);
  const filtered = library.filter(game => {
    const tags = tagsOf(game);
    const matchesGenre = activeTags.length === 0 || tags.some(tag => activeTags.includes(keyOf(tag)));
    const searchText = [game.title, game.titleEn, ...tags, ...tags.map(tag => tagLabel(tag, copy))].filter(Boolean).join(' ').toLocaleLowerCase();
    return matchesGenre && (!normalizedQuery || searchText.includes(normalizedQuery));
  });
  const hasGames = library.length > 0 || loved.length > 0;

  function toggleTag(tag) {
    setSelectedTags(current => current.includes(tag) ? current.filter(value => value !== tag) : [...current, tag]);
  }

  function reset() {
    setSelectedTags([]);
    setQuery('');
  }

  return <section className="gc-collection" data-language={language} data-motion={motion ? 'full' : 'reduced'} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className="gc-main-title">{copy.collection}</h2>
    {hasGames && <div className="gc-journey-intro"><p>{copy.journeyIntro}</p>{officialUrl(collectionMeta?.steamProfileUrl) && <a href={officialUrl(collectionMeta.steamProfileUrl)} target="_blank" rel="noopener noreferrer">{copy.steamProfile}<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg></a>}</div>}
    {!hasGames ? <p className="gc-empty-copy">{copy.empty}</p> : <>
      {loved.length > 0 && <section id="about-favorites" className="gc-favorites" aria-labelledby={`${id}-favorites`}>
        <header className="gc-shelf-heading" data-enter="copy">
          <div><h3 id={`${id}-favorites`}>{copy.favorites}</h3><p className="gc-shelf-intro">{copy.intro}</p></div>
          <SizeControl value={favoriteSize} onChange={setFavoriteSize} min={160} max={420} copy={copy} label={copy.favorites} />
        </header>
        <div className="gc-grid gc-favorite-grid" style={{ '--gc-card-size': `${favoriteSize}px` }}>
          {loved.map(game => <GameCard key={game.id} game={game} favorite featured language={language} copy={copy} />)}
        </div>
      </section>}

      {library.length > 0 && <section id="about-library" className="gc-library" aria-labelledby={`${id}-library`}>
        <header className="gc-shelf-heading" data-enter="copy">
          <div><h3 id={`${id}-library`}>{copy.library}</h3><p className="gc-count" role="status" aria-live="polite" aria-atomic="true">{copy.count(filtered.length, library.length)}</p>{collectionMeta?.coverage === 'partial' && <p className="gc-coverage">{copy.coverage}</p>}</div>
          <SizeControl value={librarySize} onChange={setLibrarySize} min={100} max={320} copy={copy} label={copy.library} />
        </header>

        <div className="gc-library-controls">
          <fieldset className="gc-genres">
            <legend>{copy.genres}<span className="gc-filter-hint">{copy.filterHint}</span></legend>
            <div className="gc-genre-options">
              <button className="gc-genre" type="button" aria-pressed={activeTags.length === 0} data-site-sound={activeTags.length > 0 || query ? 'filter' : undefined} data-site-sound-repeat="true" onClick={reset}>{copy.all}</button>
              {genres.map(([key, tag]) => <button className="gc-genre" type="button" key={key} aria-pressed={activeTags.includes(key)} data-site-sound="filter" data-site-sound-repeat="true" onClick={() => toggleTag(key)}>{tagLabel(tag, copy)}</button>)}
            </div>
          </fieldset>
          <label className="gc-search"><span className="gc-sr-only">{copy.search}</span><SearchIcon /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} /></label>
        </div>

        {filtered.length > 0 ? <div className="gc-grid gc-library-grid" style={{ '--gc-card-size': `${librarySize}px` }}>
          {filtered.map(game => <GameCard key={game.id} game={game} favorite={favoriteSet.has(game.id)} language={language} copy={copy} />)}
        </div> : <div className="gc-no-match"><p>{copy.noMatch}</p><button type="button" data-site-sound="filter" onClick={reset}>{copy.reset}</button></div>}
      </section>}
    </>}
  </section>;
}

export default GameCollection;
