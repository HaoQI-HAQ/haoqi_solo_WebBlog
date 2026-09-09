# haoqi_solo_WebBlog

浩祈的个人作品集网站，当前为 React + Vite v0 基础版本。

## 本地运行

```bash
npm install
npm run dev
```

## 当前页面

- 全屏视频 Hero 与锚点导航
- 个人经历与联系信息
- 精选项目大卡片
- 游戏策划、视觉设计、AI 编曲能力模块
- 整屏联系收尾页

页面内带有 `V0 / REPLACE IMAGE` 标记的素材是临时参考图，后续替换为真实头像和作品图片即可。

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
├─ work-04-redacted/
└─ work-05-redacted/
```

在 `src/content.js` 对应项目填写：`image: '/media/games/work-01-fragmented-life/poster.jpg'`、`videoUrl: '/media/games/work-01-fragmented-life/trailer.mp4'`。没有海报或视频时，先保留当前纯黑预览；B 站入口独立保留。游戏安装包不要放入仓库，应放网盘、itch.io 或发布页，再把网址写入 `downloadUrl`。

### 摄影作品：按时间与地区建立相册文件夹

目录为 `public/media/photos/YYYY-MM-DD-地区/`；一个相册的照片连续编号，第一张同时作为封面：

```text
public/media/photos/
├─ 2026-08-27-guangxi-guilin-yangshuo/
│  └─ 01.png              # PHOTO-01《阳朔 / 2026.08.27》
└─ 0000-00-00-region-pending/
   ├─ 01.webp             # 后续相册示例
   ├─ 02.webp
   └─ 03.webp
```

推荐 WebP、JPG 或 AVIF。将新相册的 `cover` 与 `images` 路径添加到 `src/content.js` 的 `photoAlbums`；详情页会按 `images` 的顺序左右切换与放大查看。没有实际图像时，档案必须保持纯黑预览与 `REDACTED` 文案。

### 音乐唱片：一个专辑/档案一个文件夹

目录为 `public/media/music/sound-编号-英文名/`。每张唱片至少有音频与封面：

```text
public/media/music/
├─ sound-01-somniomancer-null-set/
│  ├─ audio.mp3           # SOUND-01 音频
│  └─ cover.jpg           # 专辑封面，方形优先
├─ sound-02-redacted/
├─ sound-03-redacted/
├─ sound-04-redacted/
└─ sound-05-redacted/
```

建议 MP3（兼容性最好）或 OGG。在 `src/content.js` 的 `musicTracks` 中填写 `src: '/media/music/sound-02-专辑名/audio.mp3'` 与 `image: '/media/music/sound-02-专辑名/cover.jpg'`。音乐档案中的黑胶会读取封面与音频；无素材的槽位维持黑色封面和打码描述。

### 当前空槽位

- 游戏：`WORK-04`、`WORK-05`
- 摄影：`PHOTO-02` 至 `PHOTO-05`
- 音乐：`SOUND-02` 至 `SOUND-05`

它们在网页中均显示纯黑图片与 `ARCHIVE / REDACTED`、`MATERIAL LOCKED` 状态。填入真实素材与文案后再移除对应的 `pending: true`。

### 上传前检查

- 图片优先压缩到单张 2 MB 以下；视频建议控制在 100 MB 内并提供封面图。
- GitHub 单文件限制为 100 MB；较大的视频、音频或游戏安装包应使用对象存储、网盘或发布平台链接。
- 文件名只用英文小写、数字和连字符，避免空格与中文路径，方便线上部署。
