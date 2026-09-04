import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const projectItems = [
  {
    number: '01',
    title: 'Worlds in motion',
    subtitle: 'Game direction / narrative systems',
    detail: '把玩法、叙事与节奏组织成可进入的世界。',
    image: '/assets/desktop-a-contact.jpg',
    tone: 'project-amber',
  },
  {
    number: '02',
    title: 'A visual language',
    subtitle: 'Visual identity / art direction',
    detail: '从一张海报到一套可以持续生长的视觉系统。',
    image: '/assets/desktop-b-contact.jpg',
    tone: 'project-mint',
  },
  {
    number: '03',
    title: 'Sound as material',
    subtitle: 'AI composition / sound studies',
    detail: '用算法和直觉，寻找画面之外的情绪线索。',
    image: '/assets/tool-contact.jpg',
    tone: 'project-sand',
  },
];

const capabilityItems = [
  {
    index: '01',
    title: 'Game design',
    chinese: '游戏策划',
    body: '世界观、核心循环、关卡节奏与可玩性验证。让想法变成玩家愿意反复进入的空间。',
    tags: ['Worldbuilding', 'Systems', 'Level design'],
  },
  {
    index: '02',
    title: 'Visual design',
    chinese: '视觉设计',
    body: '视觉叙事、品牌识别、界面与动态海报。用秩序和留白建立一个项目的第一印象。',
    tags: ['Art direction', 'Identity', 'Motion'],
  },
  {
    index: '03',
    title: 'AI composition',
    chinese: 'AI 编曲',
    body: '把旋律、采样和模型能力当作新的乐器，快速探索一段情绪的多种可能。',
    tags: ['Arrangement', 'Sound design', 'Experiments'],
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const cursorRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const time = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date());
      setCurrentTime(time.replace(':', ' : '));
    };

    updateTime();
    const timer = window.setInterval(updateTime, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return undefined;

    const handlePointerMove = (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const handlePointerDown = () => cursor.classList.add('is-pressed');
    const handlePointerUp = () => cursor.classList.remove('is-pressed');

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />
      <header className={`site-header ${menuOpen ? 'menu-is-open' : ''}`}>
        <a className="brand-lockup" href="#top" onClick={closeMenu} aria-label="回到首页">
          <span className="brand-orbit" aria-hidden="true" />
          <span>HAOQI<span className="brand-slash">/</span>STUDIO</span>
        </a>
        <nav className="desktop-nav" aria-label="主导航">
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-contact" href="mailto:hello@haoqi.studio">
          Start a conversation <span aria-hidden="true">↗</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
          <span className="menu-icon" aria-hidden="true"><i /><i /></span>
        </button>
        <nav id="mobile-nav" className="mobile-nav" aria-label="移动端导航">
          <a href="#about" onClick={closeMenu}>About <span>01</span></a>
          <a href="#work" onClick={closeMenu}>Work <span>02</span></a>
          <a href="#capabilities" onClick={closeMenu}>Capabilities <span>03</span></a>
          <a href="#contact" onClick={closeMenu}>Contact <span>04</span></a>
        </nav>
      </header>

      <main>
        <section id="top" className="hero-section">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/hero-poster.png"
            aria-hidden="true"
          >
            <source src="https://videos.pexels.com/video-files/3129977/3129977-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div className="hero-noise" aria-hidden="true" />
          <div className="hero-vignette" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-inner page-width">
            <div className="hero-topline">
              <span>Independent practice / 2026</span>
              <span className="hero-topline-status"><i /> Available for selected collaborations</span>
            </div>
            <div className="hero-content">
              <p className="eyebrow">Game design · Visual direction · AI composition</p>
              <h1>
                I shape <em>play</em>,<br />
                <span className="headline-indent">image</span> &amp; sound<br />
                into <em>worlds.</em>
              </h1>
              <div className="hero-bottomline">
                <p className="hero-intro">浩祈的个人作品集。<br />把抽象的感受，做成可以被看见、被游玩、被听见的东西。</p>
                <a className="round-link" href="#work" aria-label="查看精选项目">
                  <span>Explore<br />the work</span>
                  <span className="round-link-arrow" aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
            <div className="hero-footer">
              <span>25° 02' N / 121° 32' E</span>
              <span>{currentTime || '— : —'} / UTC+8</span>
              <span className="hero-footer-scroll">Scroll to enter <span aria-hidden="true">↓</span></span>
            </div>
          </div>
        </section>

        <section id="about" className="about-section section-light">
          <div className="page-width about-layout">
            <div className="section-marker" data-reveal><span>01</span><span>About the practice</span></div>
            <div className="about-copy" data-reveal>
              <p className="section-kicker">A multidisciplinary practice</p>
              <h2>一半在系统里，<br /><span>一半在感觉里。</span></h2>
              <p className="large-copy">我是一名游戏策划、视觉设计师，也是一名 AI 编曲人。我的工作总是在寻找同一件事：让一个想法拥有自己的气候、节奏和入口。</p>
              <p className="body-copy">我相信好的体验不会把答案直接交给你。它会留下一个动作、一种声音或一块空白，让人愿意继续靠近。这里记录正在发生的项目，也记录那些还没有名字的实验。</p>
              <div className="about-links">
                <a href="mailto:hello@haoqi.studio">hello@haoqi.studio <span aria-hidden="true">↗</span></a>
                <a href="#contact">Download résumé <span aria-hidden="true">↓</span></a>
              </div>
            </div>
            <div className="profile-column" data-reveal>
              <div className="profile-card">
                <div className="profile-scanline" aria-hidden="true" />
                <div className="profile-mark">HQ</div>
                <div className="profile-coordinates">PROFILE<br />IMAGE / PENDING</div>
                <div className="profile-caption">Portrait placeholder<br />replace with your image</div>
              </div>
              <div className="profile-note"><span>Currently exploring</span><strong>Playable atmospheres</strong></div>
            </div>
          </div>
          <div className="stats-row page-width" data-reveal>
            <div className="stat-item"><strong>03</strong><span>creative disciplines</span></div>
            <div className="stat-item"><strong>∞</strong><span>iterations before the right feeling</span></div>
            <div className="stat-item"><strong>01</strong><span>practice in progress</span></div>
            <div className="stats-note">Numbers are placeholders<br />until the archive is filled.</div>
          </div>
        </section>

        <section id="work" className="work-section section-dark">
          <div className="page-width">
            <div className="section-heading-row" data-reveal>
              <div className="section-marker section-marker-dark"><span>02</span><span>Selected work</span></div>
              <p className="section-note">Three directions, one curiosity:<br />what makes a world stay with you?</p>
            </div>
            <div className="work-intro" data-reveal>
              <h2>Pieces of<br /><em>becoming.</em></h2>
              <span className="work-count">[ 03 / 03 ]</span>
            </div>
            <div className="project-grid">
              {projectItems.map((project) => (
                <article className={`project-card ${project.tone}`} key={project.number} data-reveal>
                  <a className="project-image-wrap" href="#contact" aria-label={`联系了解项目 ${project.title}`}>
                    <img src={project.image} alt="临时视觉占位图" />
                    <div className="project-image-overlay" />
                    <span className="project-placeholder">V0 / REPLACE IMAGE</span>
                    <span className="project-open" aria-hidden="true">↗</span>
                  </a>
                  <div className="project-meta">
                    <span className="project-number">{project.number}</span>
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.subtitle}</p>
                      <small>{project.detail}</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="work-footer" data-reveal><span>Archive in progress</span><a href="#contact">View all notes <span aria-hidden="true">↗</span></a></div>
          </div>
        </section>

        <section id="capabilities" className="capabilities-section section-light">
          <div className="page-width">
            <div className="section-heading-row" data-reveal>
              <div className="section-marker"><span>03</span><span>Capabilities</span></div>
              <p className="section-note">Different tools, same instinct:<br />make the invisible legible.</p>
            </div>
            <div className="capability-lead" data-reveal>
              <p className="section-kicker">What I bring into the room</p>
              <h2>从问题出发，<br /><span>到体验落地。</span></h2>
            </div>
            <div className="capability-grid">
              {capabilityItems.map((item) => (
                <article className="capability-card" key={item.index} data-reveal>
                  <div className="capability-top"><span>{item.index}</span><span className="capability-plus" aria-hidden="true">+</span></div>
                  <div className="capability-title"><h3>{item.title}</h3><span>{item.chinese}</span></div>
                  <p>{item.body}</p>
                  <div className="tag-list">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section section-dark">
          <div className="contact-orbit contact-orbit-a" aria-hidden="true" />
          <div className="contact-orbit contact-orbit-b" aria-hidden="true" />
          <div className="page-width contact-inner">
            <div className="section-marker section-marker-dark" data-reveal><span>04</span><span>Contact</span></div>
            <div className="contact-content" data-reveal>
              <p className="section-kicker">Have a world in mind?</p>
              <h2>Let’s make<br /><em>something enterable.</em></h2>
              <a className="contact-email" href="mailto:hello@haoqi.studio">hello@haoqi.studio <span aria-hidden="true">↗</span></a>
            </div>
            <div className="contact-footer" data-reveal>
              <span>Open to selected collaborations / 2026</span>
              <div className="contact-footer-links"><a href="#top">Back to top <span aria-hidden="true">↑</span></a><a href="https://github.com/HaoQI-HAQ/haoqi_solo_WebBlog" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
