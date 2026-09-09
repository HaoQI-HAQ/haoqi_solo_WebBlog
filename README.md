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

### 游戏视频

放在 `public/media/games/`，建议使用浏览器兼容性最好的 MP4（H.264 视频 + AAC 音频）。当前三个档案可按下面命名：

```text
public/media/games/fragmented-life.mp4      # WORK-01《残片人生》
public/media/games/nuo-mask-prisoner.mp4    # WORK-02《傩面之囚》
public/media/games/five-second-real-man.mp4 # WORK-03《五秒真男人》
```

放入后，在 `src/content.js` 对应项目的 `videoUrl` 写入，例如：`/media/games/fragmented-life.mp4`。网站内会使用原生播放器；B 站按钮保留为外部观看入口。游戏安装包不要放进仓库，建议放到网盘、itch.io 或其他下载页后，将链接写入对应项目的 `downloadUrl`。

### 摄影作品

放在 `public/media/photos/`，每个相册单独一个文件夹，使用 WebP、JPG 或 AVIF：

```text
public/media/photos/guangzhou-night-walk/01.webp
public/media/photos/guangzhou-night-walk/02.webp
public/media/photos/shanghai-soft-grid/01.webp
```

在 `src/content.js` 的 `photoAlbums` 内，为相册填写 `cover` 和 `images` 列表；每张图片使用 `/media/photos/相册名/文件名.webp`。详情页会按 `images` 的顺序提供左右切换与放大查看。

### 音乐

放在 `public/media/music/`，建议 MP3（兼容性最好）或 OGG：

```text
public/media/music/rain-loop-study.mp3
public/media/music/city-night-sketch.mp3
public/media/music/menu-pulse.mp3
```

在 `src/content.js` 的 `musicTracks` 内，把对应曲目的 `src` 写为 `/media/music/文件名.mp3`。音乐档案中的黑胶界面会读取这个音源；无音源时会显示“音源待添加”。

### 上传前检查

- 图片优先压缩到单张 2 MB 以下；视频建议控制在 100 MB 内并提供封面图。
- GitHub 单文件限制为 100 MB；较大的视频、音频或游戏安装包应使用对象存储、网盘或发布平台链接。
- 文件名只用英文小写、数字和连字符，避免空格与中文路径，方便线上部署。
