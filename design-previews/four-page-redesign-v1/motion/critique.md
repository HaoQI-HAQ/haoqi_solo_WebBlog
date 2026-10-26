# 动效预览视觉核对

以下为设计自评，只针对本地交互预览，不是对正式站或外部评审的评分。

ROUND 1
Seen in one second: 摄影是横幅全景，音乐以真实封面与曲目为主体，联系是大邮箱，About是姓名与实际作品。
Idea (one sentence): 浩祈现有的全景、唱片与游戏视觉成为页面的主体材料，动作解释进入、切换与归位。
Live thing: 原位展开摄影、专辑切换与真实播放、邮件主题与复制、创作方向切换。
Layout words by section: photography=全景画册 / music=聆听室 / contact=直接联系 / about=作品说明。
Scores: design 7.5 · usability 7 · creativity 7.5 · content 8 → overall 7.4（自评）。
Caps applied: 无外部评审分数；缺失素材不以图库替代。
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. 摄影主图原先512px缓存用于桌面不够清晰；photography-1440.jpg：由原图生成1920px WebP，约80KB，原图在灯箱按需加载。
2. About手机方向标题的“口。”单独掉行；about-390.jpg：保留有意义的两行断点，底部联系段改纵向，避免挤压。
3. 手机专辑目录与说明字为12px；music-390.jpg：次要说明统一至少13px，复核换行与横向溢出。

ROUND 2
Seen in one second: 四页保留同一品牌，但大图、唱片、邮箱和姓名各自领导构图。
Idea (one sentence): 内容已经可见，短暂动作只揭示它们之间的空间关系与选择结果。
Live thing: 桌面与手机实际操作通过；快速反复切换保留最后选择，摄影Esc/切页可归位，音乐跨预览页继续。
Layout words by section: photography=原比例大图 / music=封面与曲目并列 / contact=大邮箱加直接动作 / about=身份与作品交接。
Scores: design 8 · usability 8 · creativity 7.5 · content 8 → overall 7.9（自评）。
Caps applied: 这是确认稿，正式四页未替换；手机菜单修复独立进入正式站，不能当作四页已发布。
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. 摄影的文字“查看原图”在桌面首屏下沿，摄影本身已是可点击按钮；desktop-fold.jpg：保留优先看照片的次序，悬停/键盘显示“展开全景”，不插入额外促销按钮。
2. 摄影只有一张有效原图，无法形成多相册叙事；desktop-page-01.jpg：呈现一个真实相册，等用户继续添加素材，不生成虚假旅程。
3. 预览工具占据额外一行，mobile-fold.jpg：仅用于重播/简化对比，正式替换时收敛为用户需要的控制，不把确认提示带到正式产品。

通用巡检的保留项与实测范围见README；没有使用外部图库或新增视频。
