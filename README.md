# haoqi_solo_WebBlog

浩祈的个人作品集，使用 React + Vite，收录游戏策划、视觉设计、摄影与音乐收藏。当前准备的是本地发布候选，尚未选择托管平台或发布公网；新增源码和素材仍需审查后保存到 Git。

## 本地运行

先进入包含 `package.json` 的项目目录，使用 **Node.js 24**（见 `.node-version`、`.nvmrc`），再按锁文件安装：

```powershell
npm ci
npm run dev
```

打开终端显示的地址。开发服务需要保持运行；关闭终端后，本地地址不会继续提供网页。

## 当前页面

| 入口 | 内容 |
| --- | --- |
| `/` | 图片 Hero、作品入口与首页内容 |
| `/work.html` | 动态档案阵列、启动动画、可旋转游戏光盘/摄影相框/黑胶模型与作品详情 |
| `/photography.html` | 摄影预览、原图查看与拍摄信息 |
| `/music.html` | 专辑、曲目、歌词与播放控制 |
| `/contact.html` | 联系方式、复制与有效社交入口 |
| `/about.html` | 个人介绍、喜欢的游戏与个人游戏库 |

各页共用手机 MENU、语言与音效设置。未知路径显示自定义 404；正式 HTTP 404 状态仍需在所选托管平台验证。About 的游戏库是整理中的个人记录，不是实时、完整的 Steam 库。

## 构建、检查与本地恢复候选

```powershell
npm test
npm run verify:deploy
npm run verify:fonts
npm run verify:assets
npm run check:release
npm run build:full
npm run preview
```

`build:full` 生成随站包含媒体的 `dist`。`build:deploy` 在媒体地址为空时也保留完整媒体；只有明确配置外置媒体后才生成轻量包。公开前使用 `npm run check:release -- --public` 检查真实域名、媒体模式和公开音轨记录。当前没有真实网站域名，不生成猜测的 canonical 或 sitemap；填写有效 HTTPS 根域 `VITE_SITE_URL` 后才生成它们。保持 `VITE_BASE=/`，当前不支持子目录部署。

字体已在 `public/fonts/` 自托管：IBM Plex Mono、Space Grotesk、Syne，保留原字体族与许可文件，由 `src/fonts.css` 使用本地 WOFF2；中文、日文等字符继续使用系统回退字体。构建和浏览不需要访问 Google Fonts。来源与校验见 `public/fonts/README.md`、`sources.json`。

本地私有恢复包使用 `npm run snapshot:source`，默认写入被忽略的 `release-artifacts/source-snapshots/`。默认含源文件和轻量素材，重媒体只有路径/大小/SHA256 清单；`npm run snapshot:source -- --with-media` 才将全部已盘点媒体纳入。归档附恢复说明、Git 状态和 HEAD/tree 哈希，排除实际 `.env`、密钥、依赖、Git 历史和临时文件。它不会提交或推送，也不等同于公开部署包。

托管选择、环境配置、媒体跨域与后续验收见 [上线指南](deploy/上线指南.md)。真实 `.env` 已忽略；`VITE_*` 会进入浏览器，不能存放服务端密钥。

## 作品素材放置说明

所有会被网站直接读取的素材放在 `public/media/` 下。Vite 会把 `public` 原样发布，因此代码中用 `/media/...` 引用，不要写 `public` 前缀。

### 游戏作品：一个作品一个文件夹

目录为 `public/media/games/work-编号-英文名/`。每个作品文件夹至少放宣传海报，若有网页内播放的视频，再放 MP4：

```text
public/media/games/
├─ work-01-fragmented-life/
│  ├─ poster.jpg          # 《残片人生》宣传海报，推荐 16:10
│  └─ trailer.mp4         # 可选：网页内播放的项目演示
├─ work-02-nuo-mask-prisoner/
│  ├─ poster.jpg
│  └─ trailer.mp4
├─ work-03-five-second-real-man/
│  ├─ poster.jpg
│  └─ trailer.mp4
├─ work-04-paoyong/
└─ work-05-redacted/
```

以上是新增素材的目录示例，实际文件名以 `src/content.js` 为准。在对应项目填写 `image`、`videoUrl`；没有素材时保持明确的未公开状态，已有 B 站入口可独立保留。游戏安装包不要放入仓库，应放网盘、itch.io 或发布页，再把网址写入 `downloadUrl`。

《五秒真男人》和《泡涌》已使用真实素材。`icon` 为游戏图标，`storeUrl` 为 TapTap 商店入口，`description` 为介绍段落，`features` 为玩法要点。`gallery` 每张图片包含 `src`、`thumbnail`、`caption`、`width`、`height` 和 `kind`；分类为 `artwork`（宣传图）、`screenshot`（实机或制作画面）、`poster`（海报）、`icon`（图标）。首页与原有 Work 详情共用这组数据，图片不裁切；来源记录见 `docs/game-media-sources.json`。

### 摄影作品：按时间与地区建立相册文件夹

目录为 `public/media/photos/YYYY-MM-DD-地区/`；一个相册的照片连续编号，第一张同时作为封面：

```text
public/media/photos/
├─ 2026-08-27-guangxi-guilin-yangshuo/
│  ├─ preview.webp        # 普通浏览与模型使用的轻量预览
│  └─ 01.png              # PHOTO-01 原图，仅放大时使用
└─ 0000-00-00-region-pending/
   ├─ 01.webp             # 后续相册示例
   ├─ 02.webp
   └─ 03.webp
```

推荐 WebP、JPG 或 AVIF。将新相册的 `cover` 与 `images` 路径添加到 `src/content.js` 的 `photoAlbums`：`cover` 指向轻量预览，`images[].src` 保留原图。首页、Work 模型和普通摄影浏览使用预览；放大查看才载入原图。多图相册按 `images` 顺序切换，没有实际图像时保持纯黑预览与 `REDACTED` 文案，不编造拍摄信息。

### 音乐唱片：一个档案一个文件夹

目录为 `public/media/music/sound-编号-英文名/`。每张唱片至少有音频与封面：

```text
public/media/music/
├─ sound-01-somniomancer-null-set/
│  ├─ 塞壬唱片-MSR,Adam Gubman - Underneath the Sanctuary.mp3
│  └─ cover.jpg
├─ sound-02-redacted/
│  └─ 专辑文件夹/          # 将该专辑的 MP3、LRC 放在这里
├─ sound-03-redacted/
├─ sound-04-redacted/
├─ sound-05-redacted/
├─ sound-06-redacted/     # SOUND-06 至 SOUND-10 已接入专辑
├─ sound-11-redacted/
│  └─ MTV UNplugged/      # BENI：9 首 MP3 与 9 份同名 LRC
├─ sound-12-redacted/     # Outer Wilds - Original Soundtrack
├─ ...                   # SOUND-13 至 SOUND-20 独立空槽
└─ sound-21-redacted/     # 空槽
```

建议使用 MP3 与同名 LRC。新专辑放进对应 `sound-编号-redacted/` 下的独立专辑文件夹，在 `src/content.js` 中填写每首 MP3、LRC 路径。新增或修改音频标签后，离线生成并核对静态曲目信息：

```powershell
node scripts/build-music-metadata.mjs
node scripts/build-music-metadata.mjs --check
```

该命令只在本地读取 ID3 标签区，将专辑、曲名与艺术家写入 `src/work-archive/musicMetadataCatalogData.js`。浏览器直接查询静态目录；打开 Music 或抽取 Work 音乐详情不会为了读取 ID3 下载整张专辑。封面与黑胶主题使用已生成的轻量 `artworkCatalog`；更新封面时可运行 `node scripts/build-archive-artwork.mjs`，此维护命令需要可用的 Sharp（可用 `SHARP_MODULE` 指向已安装包），普通构建不需要重新提取。无素材的槽位维持黑色封面和打码描述。

音乐收藏按当前配置完整保留，点击播放后才加载所选音源；浏览专辑通过离线目录显示曲目和封面。发布自检只记录专辑和音轨数量，不设置音乐授权状态门禁。

### 当前空槽位

- 游戏：`WORK-05` 至 `WORK-11`；`WORK-04`《泡涌》已有真实素材，不是空槽。
- 摄影：`PHOTO-02` 至 `PHOTO-11`；新增目录为 `0000-00-00-region-pending-photo-06/` 至 `...-11/`
- 音乐：共 21 个档案，其中 `SOUND-01` 至 `SOUND-12` 已接入专辑；`SOUND-13` 至 `SOUND-21` 为 9 个空槽，各自对应独立素材目录并保留 `.gitkeep`。

它们在 Work 阵列中保留明确的纯黑图片与 `ARCHIVE / REDACTED`、`MATERIAL LOCKED` 状态，不伪装成可抽取的完整作品；首页只展示已整理内容。填入真实素材与文案后再移除对应的 `pending: true`。

### 新增空槽位的必做规则

以后每新增一个 `WORK`、`PHOTO` 或 `SOUND` 空槽位，必须在同一次修改中完成以下两件事：

1. 在 `src/content.js` 新增该档案，并使用纯黑占位图、`ARCHIVE / REDACTED` 与 `pending: true`。
2. 在对应的 `public/media/` 分类目录创建该档案专属文件夹，即使暂时为空也保留 `.gitkeep`。

文件夹命名规则如下：

```text
游戏：public/media/games/work-06-redacted/（填入素材后可按项目名重命名，并同步更新路径）
摄影：public/media/photos/YYYY-MM-DD-地区名-photo-06/
音乐：public/media/music/sound-06-redacted/专辑文件夹/
```

摄影在未知拍摄时间或地区时，先使用 `0000-00-00-region-pending-photo-编号/`；获取真实信息后再重命名为日期与地区。不要让多个摄影档案共用同一个文件夹。

### 上传前检查

- 图片优先压缩到单张 2 MB 以下；视频建议控制在 100 MB 内并提供封面图。
- GitHub 单文件限制为 100 MB；较大的视频、音频或游戏安装包应使用对象存储、网盘或发布平台链接。
- 新增文件建议用英文小写、数字和连字符。现有音乐保留中文与空格路径，发布时应按当前路径完整上传并验证 URL 编码，不要为改名破坏已配置的引用。
