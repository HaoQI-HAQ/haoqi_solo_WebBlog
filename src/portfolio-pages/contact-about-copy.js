const mixed = {
  contact: {
    title: 'Contact', intro: '聊聊你的下一个作品。', roles: '游戏策划、视觉设计、AI 编曲。',
    direct: '直接联系', send: '发送邮件', copy: '复制邮箱', copied: '邮箱已复制', manual: '已选中，请手动复制',
    topicTitle: '想聊些什么？', topicGroup: '邮件主题', topics: ['游戏', '视觉', '音乐', '其他'],
    subjects: ['与浩祈聊聊游戏合作', '与浩祈聊聊视觉合作', '与浩祈聊聊音乐合作', '与浩祈聊聊一个想法'],
    subjectLabel: '邮件主题：', socials: '社交主页', findMe: '也可以在这里找到我',
  },
  about: {
    identity: '我是浩祈', roles: '游戏策划 · 视觉设计 · AI 编曲',
    statement: ['我在玩法、影像与声音之间工作。', '让一个想法，拥有自己的气候、', '节奏和入口。'],
    gameAlt: '《泡涌》游戏宣传图', photoAlt: '阳朔日落全景局部',
    practiceLabel: '我的三个创作方向', choosePractice: '选择创作方向', heading: ['同一个想法，', '不同的入口。'],
    practices: [
      { title: '玩法', statement: '把有趣的规则，变成可游玩的体验。', description: '从核心循环到关卡节奏，关注玩家怎样理解规则、做出选择，再走进一个世界。', alt: '《泡涌》蓝色水母与水下遗迹宣传视觉', caption: '泡涌 · 游戏作品', link: '查看游戏作品' },
      { title: '影像', statement: '用镜头收藏路过的世界。', description: '在地点、光线和画面之间寻找叙事。阳朔的山与河，是一次真实行走留下的片段。', alt: '阳朔相公山日落与漓江全景', caption: '阳朔 · 2026.08.27', link: '进入摄影画册' },
      { title: '声音', statement: '让情绪，在旋律中发生。', description: '从聆听中理解旋律、编排与叙事。这里收录的是音乐收藏与分析，保留原作品和艺人的署名。', alt: 'Nujabes feat. Shing02 的 Luv(sic) Hexalogy 专辑封面', caption: 'Luv(sic) Hexalogy · Nujabes feat. Shing02 · 音乐收藏', link: '进入私人聆听室' },
    ],
    invitation: '有个正在成形的世界？', contactLink: '来聊聊',
  },
};

export const contactAboutCopy = {
  mixed,
  zh: { ...mixed, contact: { ...mixed.contact, title: '联系' } },
  en: {
    contact: {
      title: 'Contact', intro: 'Let’s talk about your next work.', roles: 'Game design, visual design and AI composition.',
      direct: 'Contact directly', send: 'Send email', copy: 'Copy email', copied: 'Email copied', manual: 'Selected — copy manually',
      topicTitle: 'What’s on your mind?', topicGroup: 'Email topic', topics: ['Games', 'Visuals', 'Music', 'Other'],
      subjects: ['Game collaboration with Haoqi', 'Visual collaboration with Haoqi', 'Music collaboration with Haoqi', 'An idea to share with Haoqi'],
      subjectLabel: 'Subject: ', socials: 'Social profiles', findMe: 'You can also find me here',
    },
    about: {
      identity: 'I’m Haoqi', roles: 'Game design · Visual design · AI composition',
      statement: ['I work across play, image and sound, giving an idea its own atmosphere, rhythm and way in.'],
      gameAlt: 'Promotional artwork for Paoyong', photoAlt: 'Detail of a sunset panorama in Yangshuo',
      practiceLabel: 'My three creative practices', choosePractice: 'Choose a creative practice', heading: ['One idea.', 'Different ways in.'],
      practices: [
        { title: 'Play', statement: 'Turning interesting rules into playable experiences.', description: 'From core loops to the rhythm of a level, I explore how players understand rules, make choices and enter a world.', alt: 'A blue jellyfish and underwater ruins in Paoyong promotional artwork', caption: 'Paoyong · Game work', link: 'Explore game work' },
        { title: 'Image', statement: 'Keeping the world I pass through.', description: 'I look for stories between places, light and composition. The mountains and rivers of Yangshuo are fragments of a real journey.', alt: 'Sunset over the Li River and Xianggong Mountain in Yangshuo', caption: 'Yangshuo · 2026.08.27', link: 'Open the photo journal' },
        { title: 'Sound', statement: 'Letting emotion unfold through melody.', description: 'Listening is a way to understand melody, arrangement and narrative. This collection and its notes retain credits for the original works and artists.', alt: 'Luv(sic) Hexalogy album cover by Nujabes feat. Shing02', caption: 'Luv(sic) Hexalogy · Nujabes feat. Shing02 · Music collection', link: 'Enter the listening room' },
      ],
      invitation: 'Have a world taking shape?', contactLink: 'Let’s talk',
    },
  },
  ja: {
    contact: {
      title: '連絡', intro: '次の作品について話しましょう。', roles: 'ゲームデザイン、ビジュアル、AI 作曲。',
      direct: '直接連絡する', send: 'メールを送る', copy: 'メールをコピー', copied: 'コピーしました', manual: '選択済み・手動でコピー',
      topicTitle: 'どんなお話ですか？', topicGroup: 'メールの話題', topics: ['ゲーム', '映像', '音楽', 'その他'],
      subjects: ['HAOQI とゲーム制作について', 'HAOQI とビジュアル制作について', 'HAOQI と音楽制作について', 'HAOQI にアイデアを相談'],
      subjectLabel: '件名：', socials: 'SNS プロフィール', findMe: 'こちらでも活動しています',
    },
    about: {
      identity: 'HAOQI です', roles: 'ゲームデザイン · ビジュアル · AI 作曲',
      statement: ['遊び、映像、音を行き来しながら、', 'ひとつの発想に空気とリズム、', 'そして入口をつくっています。'],
      gameAlt: 'ゲーム「泡涌」のプロモーション画像', photoAlt: '陽朔の夕景パノラマの一部',
      practiceLabel: '3 つの制作領域', choosePractice: '制作領域を選ぶ', heading: ['ひとつの発想、', '異なる入口。'],
      practices: [
        { title: '遊び', statement: '面白いルールを、遊べる体験へ。', description: 'コアループからレベルのリズムまで。プレイヤーがルールを理解し、選び、世界へ入っていく過程を考えています。', alt: '「泡涌」の青いクラゲと水中遺跡のプロモーション画像', caption: '泡涌 · ゲーム作品', link: 'ゲーム作品を見る' },
        { title: '映像', statement: '通り過ぎた世界を、レンズで残す。', description: '場所、光、構図のあいだに物語を探します。陽朔の山と川は、実際に歩いた旅のかけらです。', alt: '陽朔・相公山と漓江の夕景パノラマ', caption: '陽朔 · 2026.08.27', link: '写真を見る' },
        { title: '音', statement: '旋律のなかで、感情が動き出す。', description: '聴くことを通じて、旋律、編曲、物語を考えます。音楽コレクションと分析には原作品とアーティストのクレジットを残しています。', alt: 'Nujabes feat. Shing02 の Luv(sic) Hexalogy アルバムジャケット', caption: 'Luv(sic) Hexalogy · Nujabes feat. Shing02 · 音楽コレクション', link: 'リスニングルームへ' },
      ],
      invitation: '形になりつつある世界がありますか？', contactLink: '話しましょう',
    },
  },
  ru: {
    contact: {
      title: 'Контакты', intro: 'Обсудим вашу следующую работу.', roles: 'Игровой дизайн, визуальный дизайн и AI-музыка.',
      direct: 'Связаться напрямую', send: 'Написать письмо', copy: 'Копировать почту', copied: 'Адрес скопирован', manual: 'Выделено — скопируйте вручную',
      topicTitle: 'О чём поговорим?', topicGroup: 'Тема письма', topics: ['Игры', 'Визуал', 'Музыка', 'Другое'],
      subjects: ['Игровой проект с Haoqi', 'Визуальный проект с Haoqi', 'Музыкальный проект с Haoqi', 'Идея для обсуждения с Haoqi'],
      subjectLabel: 'Тема: ', socials: 'Профили в соцсетях', findMe: 'Меня можно найти и здесь',
    },
    about: {
      identity: 'Я Haoqi', roles: 'Игровой дизайн · Визуальный дизайн · AI-музыка',
      statement: ['Я работаю с игрой, изображением и звуком, придавая идее свою атмосферу, ритм и точку входа.'],
      gameAlt: 'Промоматериал игры «泡涌»', photoAlt: 'Фрагмент панорамы заката в Яншо',
      practiceLabel: 'Три направления моей работы', choosePractice: 'Выбрать направление', heading: ['Одна идея.', 'Разные пути.'],
      practices: [
        { title: 'Игра', statement: 'Превращаю интересные правила в игровой опыт.', description: 'От основного цикла до ритма уровня — меня интересует, как игрок понимает правила, делает выбор и входит в мир.', alt: 'Синяя медуза и подводные руины на промоарте игры «泡涌»', caption: '泡涌 · Игровой проект', link: 'Посмотреть игры' },
        { title: 'Кадр', statement: 'Сохраняю мир, через который прохожу.', description: 'Ищу истории между местом, светом и композицией. Горы и реки Яншо — фрагменты реального путешествия.', alt: 'Закат над рекой Лицзян и горой Сянгун в Яншо', caption: 'Яншо · 2026.08.27', link: 'Открыть фотоальбом' },
        { title: 'Звук', statement: 'Даю эмоциям раскрыться в мелодии.', description: 'Через слушание изучаю мелодию, аранжировку и повествование. В коллекции и заметках сохранены названия оригинальных работ и имена авторов.', alt: 'Обложка Luv(sic) Hexalogy — Nujabes feat. Shing02', caption: 'Luv(sic) Hexalogy · Nujabes feat. Shing02 · Музыкальная коллекция', link: 'В комнату прослушивания' },
      ],
      invitation: 'Ваш мир обретает форму?', contactLink: 'Обсудим',
    },
  },
};
