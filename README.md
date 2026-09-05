# haoqi_solo_WebBlog

浩祈的个人作品集网站，当前为 React + Vite v0 基础版本。

## 本地运行

```bash
npm install
npm run dev
```

## 当前页面

- `index.html`：全屏视频 Hero 首页，并保留完整下滑浏览内容流
- `work.html`：游戏作品独立页面
- `photography.html`：摄影归档、城市标签、年份筛选、地图和灯箱
- `music.html`：音乐CD、音乐分析、曲目选择、侧边栏播放器和上传功能占位
- `contact.html`：邮箱与社交链接

导航使用独立 HTML 页面跳转；首页仍支持鼠标滚轮向下连续预览各个内容区块。语言、主题和当前曲目通过 `localStorage` 在页面之间保留。

页面内带有 `V0 / REPLACE IMAGE` 标记的素材是临时参考图，后续替换为真实头像和作品图片即可。
