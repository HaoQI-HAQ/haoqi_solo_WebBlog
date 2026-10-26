# 正式摄影、音乐、联系与关于页

用户于 2026-10-22 确认四页动效稿，并要求手机导航与首页相同。正式路径为 `/photography.html`、`/music.html`、`/contact.html`、`/about.html`，由 `PortfolioPages.jsx` 组织；SiteRouter 注入与首页相同的 SiteHeader，不再使用预览的横排导航。旧预览地址会转到对应正式路径。

保留已确认的构图与有界动效。默认完整动态，当前访问可在页脚切换简化。五种语言的界面文案独立于真实专辑和作品标题。全景预览从原图生成1920px WebP，原图只在打开灯箱时加载；媒体依旧通过content.deploy处理对象存储前缀。

Music 页不创建 audio，消费 MusicTools 的唯一全站播放器：`haoqi-play-track` 选择实际曲目，`haoqi-player-command` 控制 toggle / seek / previous / next，`haoqi-player-state` 同步实际播放信息，`haoqi-player-request-state` 在返回页面时取得当前状态。浏览专辑不打断播放，离开页面后播放器持续运行。

全站音效默认开启，由 Router 外的 `SiteSoundProvider` 共用一个 Web Audio 设备。各页不自行创建声音设备；真实异步结果和弹窗动作使用 `emitSiteSound`，明确点击控件使用 `data-site-sound`。复制仅在成功后确认，照片 ESC/遮罩关闭只发一次，搜索和进度更新不发声。全站静音位于左下播放器面板，与 Work 开关同步；详见 `docs/site-audio-theme.md`。

验证：1440 / 768 / 390 / 320px 四页布局、首页 Menu 几何一致性、五语窄屏溢出、默认完整动态与单audio；桌面和手机核对灯箱展开 / Escape / 换路由清理、快速封面切换、真实播放 / seek / 切歌 / 返回续播、邮件主题 / 复制、About 方向与原Work抽取。轻量生产构建通过。详见 `.taste-skill/live-portfolio-qa/` 与对应 verify-live-portfolio 脚本。

正式摄影页通用风格巡检的六张截图也已逐张查看。巡检包含全站共享导航和折叠播放器，因此原始结果的六项 FAIL 不能等同于本次四页的布局或功能故障，也不宣称原始巡检全部通过：mono / text-shadow 来自用户要求保持一致的现有品牌及导航状态；shadow / hairline / gradient 来自原播放器的唱针描边、边框与模拟黑胶沟槽；reduced-hidden 包含按交互隐藏的展开提示和关闭状态播放器文字，实际页面主体、手动简化模式、灯箱及播放操作已单独验证。保留这些共享组件符合本次“导航跟首页保持一致，其余保留”的明确范围。没有为了通用图片或视频数量指标加入不属于作者的素材。

明确记录以上例外后重跑为0 FAIL / 7 WARN。剩余micro-label、small-text、glass及size-count含原播放器与共享导航的既有样式，按本次范围保留；first-action对应桌面先看全景，图片本身可点击并有键盘展开提示；name-only-title下实际有18px以上的中文摄影说明，截图可见；no-footage因没有合适的作者摄影视频而保留。五档宽度的完整六页导航回归及四个旧预览地址重定向均通过。

2026-10-22 随后按用户指定的huxx参考重做About：兴趣拼贴开场、游戏旅程、22款用户确认最爱、26款去重收藏。新增AboutInterests与GameCollection，保留原创作方向切换及全站导航。完整Steam列表匿名访问需登录，页面明确为个人最爱和公开游玩记录；逐项来源见docs/game-library-sources.json，设计与巡检边界见docs/about-game-collection-design.md。26张官方素材已缓存WebP，约1.7MB。默认完整动态与用户手动简化均包含新组件。
