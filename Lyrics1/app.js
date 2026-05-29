// 周杰伦歌词本 App 核心交互逻辑

// 全局错误诊断器：一旦发生任何 JS 异常，直接以红底白字浮层展示在手机屏幕上，方便调试
window.onerror = function(message, source, lineno, colno, error) {
  showGlobalError(`[JS 错误] ${message}\n源文件: ${source}\n行号: ${lineno}:${colno}\n堆栈: ${error ? error.stack : '无'}`);
  return false;
};
window.onunhandledrejection = function(event) {
  showGlobalError(`[未处理的 Promise 拒绝] ${event.reason}`);
};

function showGlobalError(errMessage) {
  let errDiv = document.getElementById('global-error-panel');
  if (!errDiv) {
    errDiv = document.createElement('div');
    errDiv.id = 'global-error-panel';
    errDiv.style.position = 'fixed';
    errDiv.style.top = '10px';
    errDiv.style.left = '10px';
    errDiv.style.right = '10px';
    errDiv.style.maxHeight = '80vh';
    errDiv.style.overflowY = 'auto';
    errDiv.style.backgroundColor = 'rgba(255, 59, 48, 0.95)';
    errDiv.style.color = '#fff';
    errDiv.style.padding = '16px';
    errDiv.style.borderRadius = '12px';
    errDiv.style.fontSize = '12px';
    errDiv.style.fontFamily = 'monospace';
    errDiv.style.whiteSpace = 'pre-wrap';
    errDiv.style.zIndex = '9999';
    errDiv.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    errDiv.style.border = '2px solid #fff';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭诊断器';
    closeBtn.style.display = 'block';
    closeBtn.style.marginTop = '10px';
    closeBtn.style.padding = '6px 12px';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.border = 'none';
    closeBtn.style.backgroundColor = '#fff';
    closeBtn.style.color = '#ff3b30';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => errDiv.style.display = 'none';
    
    errDiv.appendChild(closeBtn);
    document.body.appendChild(errDiv);
  }
  const pre = document.createElement('pre');
  pre.textContent = errMessage + '\n\n-------------------\n\n';
  errDiv.insertBefore(pre, errDiv.firstChild);
  errDiv.style.display = 'block';
}

// 1. 专辑元数据映射（封面图片、发布年份）
const ALBUM_METADATA = {
  "十一月的萧邦": { cover: "专辑封面/11月的萧邦-2005.webp", year: "2005" },
  "Jay": { cover: "专辑封面/Jay-2000.webp", year: "2000" },
  "七里香": { cover: "专辑封面/七里香-2004.webp", year: "2004" },
  "依然范特西": { cover: "专辑封面/依然范特西-2006.webp", year: "2006" },
  "八度空间": { cover: "专辑封面/八度空间-2002.webp", year: "2002" },
  "十二新作": { cover: "专辑封面/十二新作-2012.webp", year: "2012" },
  "叶惠美": { cover: "专辑封面/叶惠美-2003.webp", year: "2003" },
  "惊叹号": { cover: "专辑封面/惊叹号-2011.webp", year: "2011" },
  "我很忙": { cover: "专辑封面/我很忙-2007.webp", year: "2007" },
  "范特西": { cover: "专辑封面/范特西-2001.webp", year: "2001" },
  "跨时代": { cover: "专辑封面/跨时代-2010.webp", year: "2010" },
  "魔杰座": { cover: "专辑封面/魔杰座-2008.webp", year: "2008" }
};

// 2. 状态管理
let state = {
  albums: [],        // 过滤并加工后的专辑数据
  flatSongs: [],     // 扁平化的所有歌曲数据（用于全局快速检索）
  favorites: [],     // 收藏的歌曲唯一ID数组
  searchHistory: [], // 历史搜索记录
  activeTab: 'albums',
  currentSong: null,
  selectedLyrics: [], // 当前选中的歌词行内容数组
  currentSearchType: 'all', // 'all', 'album', 'song', 'lyric'
  isExactMatch: false,
  showCD: true
};

// 3. 初始化入口
document.addEventListener('DOMContentLoaded', () => {
  initData();
  loadFavorites();
  loadSearchHistory();
  initDOMEvents();
  renderAlbums();
  renderHistory();
});

// 数据初始化
function initData() {
  if (!window.LYRICS_DATA) {
    showToast('数据加载失败，请检查数据文件。');
    return;
  }
  
  // 过滤并排序专辑数据
  let idCounter = 1;
  state.albums = window.LYRICS_DATA
    .filter(album => album.name !== "非专辑" && album.songs && album.songs.length > 0)
    .map(album => {
      const meta = ALBUM_METADATA[album.name] || { cover: "专辑封面/default.webp", year: "未知" };
      
      // 为歌曲添加唯一ID和所属专辑信息
      const formattedSongs = album.songs.map((song, songIdx) => {
        const songId = `song_${idCounter++}`;
        const songObj = {
          id: songId,
          name: song.name,
          singer: song.singer || "周杰伦",
          composer: song.composer || "周杰伦",
          lyricist: song.lyricist || "周杰伦",
          songLrc: song.songLrc || [],
          pinyinName: getPinyinInitials(song.name), // 提取拼音首字母用于搜索
          albumName: album.name,
          cover: meta.cover,
          year: meta.year,
          index: songIdx + 1
        };
        // 放入扁平化列表中，方便检索
        state.flatSongs.push(songObj);
        return songObj;
      });

      return {
        name: album.name,
        year: meta.year,
        cover: meta.cover,
        songs: formattedSongs
      };
    });

  // 按专辑年份升序排序
  state.albums.sort((a, b) => parseInt(a.year) - parseInt(b.year));
}

// 加载收藏列表
function loadFavorites() {
  try {
    const saved = localStorage.getItem('jay_lyrics_favorites');
    if (saved) {
      state.favorites = JSON.parse(saved);
    }
  } catch (e) {
    console.error('加载收藏夹失败:', e);
  }
  // 强力保障：如果解析出来不是数组或者是 null，强制重置为空数组
  if (!Array.isArray(state.favorites)) {
    state.favorites = [];
  }
}

// 保存收藏列表
function saveFavorites() {
  try {
    localStorage.setItem('jay_lyrics_favorites', JSON.stringify(state.favorites));
  } catch (e) {
    console.error('保存收藏夹失败(当前协议或浏览器隐私设置可能限制写入localStorage):', e);
  }
}

// 简易汉字转拼音首字母算法，用于歌名检索
function getPinyinInitials(str) {
  if (typeof str !== 'string') return '';
  const pinyinArr = [];
  const charMap = {
    'a': '啊阿', 'b': '八半不吧白避奔波边步兵报悲本憋病表捕拨杯被爸辈版榜般保包玻剥博',
    'c': '七才草拆擦猜踩彩惨惨仓苍舱操草册侧策测层叉插查茶察差拆柴缠产颤猖场常长厂敞畅唱超抄朝潮吵炒车扯彻撤尘臣沉辰陈晨闯衬称趁撑成呈承诚城乘惩程秤吃失迟池驰池迟持赤翅充冲虫崇宠抽仇绸愁筹稠丑瞅臭出初除楚处触川穿传船喘串疮窗床创吹炊垂锤春椿醇唇纯准捉桌拙昨琢作左佐',
    'd': '大答打代带待怠戴丹单担石担胆旦弹蛋当挡党荡刀导岛倒盗道稻得德的等登灯等低滴提敌涤的底抵地第帝弟递缔颠尖点典垫电奠雕刁掉吊钓调跌叠碟丁顶盯钉鼎顶丢东冬懂动冻洞都抖斗陡督毒独读渡堵赌杜肚度渡端短段断锻堆队对吨蹲盾夺度躲惰堕多咄哆夺度',
    'e': '阿饿额恶俄饿而儿尔耳二尔',
    'f': '发法反方饭放分风封丰缝佛否夫扶拂服福抚辅父付负附复副覆赋复幅富妇',
    'g': '个各歌给根跟工公弓功共贡沟狗够古骨谷鼓固顾挂怪关观管官馆贯惯光广归规轨道鬼柜贵国果过',
    'h': '哈还孩海害汉汗好号呵和合何河和核黑痕很恨横红宏洪虹吼后厚候呼忽湖胡蝴糊胡弧虎互户护花华滑画化话怀坏欢环缓幻荒慌黄皇黄谎灰恢回悔毁汇会绘惠毁汇豁活火伙或货获祸',
    'i': '',
    'j': '几及极集级急挤及集级挤己记纪极即急疾嫉级吉技既继寄加家夹佳家架假嫁价尖坚肩艰监兼简剪检碱见件建健角脚缴叫教接皆结节解姐界借介届巾金今仅紧锦尽近进晋浸京经睛惊晶精景静境镜炯究九久酒旧救就居局菊橘咀沮举句拒具巨聚距惧锯卷倦决绝觉',
    'k': '卡开看康抗考靠科棵颗壳口扣寇枯哭酷夸跨快宽况狂矿愧溃昆捆困阔',
    'l': '啦拉来赖兰栏蓝拦篮懒烂浪劳老落乐勒雷累泪冷厘黎李理里莉鲤力历丽利励立粒联脸练粮两亮量辽疗列劣林临邻林凛吝伶灵领另留流留刘柳六陆录路乱论沦落略',
    'm': '吗妈麻马买麦卖满慢漫忙毛矛茂冒帽貌没美每门们猛梦迷眯弥秘密棉免面苗描秒庙妙民敏名明命谬摸磨摩魔抹末莫陌谋某木墓幕目牧穆',
    'n': '那纳乃奶耐南难脑恼闹呢内嫩能你拟泥逆年念娘鸟尿捏您宁凝牛扭农弄奴怒女暖略虐挪懦糯',
    'o': '哦偶喔',
    'p': '爬怕派攀盘判叛旁抛炮跑泡呸赔陪配喷盆朋棚蓬膨捧碰皮匹批劈疲脾匹屁篇偏片骗飘漂品平评凭瓶坡泼婆迫破剖铺仆扑葡铺瀑瀑欺',
    'q': '七期齐奇骑起气汽契砌器恰千迁牵铅千前钱强墙枪抢敲悄桥瞧巧切窃亲轻倾清晴情顷请庆秋丘求球区驱屈去取去趣圈全权泉缺却雀群',
    'r': '然染娆饶惹人仁忍刃认任扔仍日容荣融柔肉如儒乳入褥软阮蕊瑞锐闰若弱',
    's': '三伞散桑嗓丧扫嫂色森僧杀沙啥傻砂刹筛晒山扇单闪衫善扇陕伤商赏上尚梢烧稍少哨舌蛇设社舍射涉摄申伸身深神审甚慎生声牲升绳省盛剩尸失师诗施狮湿十什石时识实拾食蚀使始驶示世仕市式事势侍试视誓室是收手守首寿受兽售授首输书舒枢熟数暑属束述树竖数率刷耍衰双霜谁水税睡顺瞬说缩数私司丝死四寺似肆松送宋诵诉宿塑酸算虽随岁碎孙损蓑缩所索锁锁',
    't': '他它塔塌台太态谈弹叹碳汤堂糖躺趟涛桃逃淘讨套特疼梯踢提题体替天添田甜填挑条挑战贴铁听厅听挺通同铜统痛投头透突图徒涂土吐兔团推腿退吞脱托脱拖妥驼椭拓',
    'w': '挖瓦哇歪外弯湾完玩晚碗万汪王网往忘旺望危威微为违围唯委伟伪尾纬未味胃谓温文闻稳问我卧握屋无吴五武舞务物误悟雾',
    'x': '夕西吸希昔析席袭媳洗喜戏系细隙虾瞎下夏吓仙先纤咸贤闲显险现县线限香乡相箱详想向象消销小晓孝效校笑些歇协邪胁写血泄谢屑心新欣信星行醒姓胸兄弟雄休修羞宿秀袖嘘需许序叙绪续恤轩宣悬选削学雪血寻巡旬驯询循呀压押鸭牙芽崖雅亚呀咽烟延言严岩沿炎研掩眼演宴厌谚样羊阳扬养氧样要药耀爷也野夜叶一伊衣医依仪宜姨移遗颐疑乙已以意艺忆易议亦异因阴音银引隐印应英影硬映尤由邮犹油游友有又右幼雨语玉郁育遇预域欲御元园原圆源愿月悦阅云匀允许运蕴晕',
    'y': '呀压押鸭牙芽崖雅亚呀咽烟延言严岩沿炎研掩眼演宴厌谚样羊阳扬养氧样要药耀爷也野夜叶一伊衣医依仪宜姨移遗颐疑乙已以意艺忆易议亦异因阴音银引隐印应英影硬映尤由邮犹油游友有又右幼雨语玉郁育遇预域欲御元园原圆源愿月悦阅云匀允许运蕴晕',
    'z': '只之支氏汁芝枝知织肢脂蜘执直值职植殖止指纸旨指至志制治致秩智置稚质炙忠终钟衷肿种众重州周洲粥轴皱骤朱珠株诸猪竹烛主煮嘱助住注驻筑铸抓爪专砖转撰赚装壮状撞追准椎卓琢捉桌拙昨琢作左佐'
  };
  
  for (let char of str) {
    let matched = false;
    for (let key in charMap) {
      if (charMap[key].includes(char)) {
        pinyinArr.push(key);
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (/[a-zA-Z0-9]/.test(char)) {
        pinyinArr.push(char.toLowerCase());
      }
    }
  }
  return pinyinArr.join('');
}

// 加载历史记录
function loadSearchHistory() {
  try {
    const saved = localStorage.getItem('jay_lyrics_search_history');
    if (saved) {
      state.searchHistory = JSON.parse(saved);
    }
  } catch (e) {
    console.error('加载历史搜索记录失败:', e);
  }
  if (!Array.isArray(state.searchHistory)) {
    state.searchHistory = [];
  }
}

// 写入/保存历史记录
function saveSearchHistory(query) {
  if (!query) return;
  const index = state.searchHistory.indexOf(query);
  if (index > -1) {
    state.searchHistory.splice(index, 1);
  }
  state.searchHistory.unshift(query);
  state.searchHistory = state.searchHistory.slice(0, 8);
  
  try {
    localStorage.setItem('jay_lyrics_search_history', JSON.stringify(state.searchHistory));
  } catch (e) {
    console.error('保存历史记录失败:', e);
  }
  renderHistory();
}

// 清除历史记录
function clearSearchHistory() {
  state.searchHistory = [];
  try {
    localStorage.removeItem('jay_lyrics_search_history');
  } catch (e) {}
  renderHistory();
}

// 渲染历史记录栏
function renderHistory() {
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  if (!historySection || !historyList) return;

  if (state.searchHistory.length === 0) {
    historySection.style.display = 'none';
    return;
  }

  historyList.innerHTML = '';
  state.searchHistory.forEach(word => {
    const tag = document.createElement('span');
    tag.className = 'tag-item';
    tag.textContent = word;
    tag.addEventListener('click', () => {
      document.getElementById('search-input').value = word;
      document.getElementById('clear-search-btn').style.display = 'flex';
      performSearch(word);
      saveSearchHistory(word);
    });
    historyList.appendChild(tag);
  });
  
  historySection.style.display = 'block';
}

// 4. DOM事件初始化
function initDOMEvents() {
  // Tab 栏切换
  const tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.dataset.tab;
      switchTab(targetTab);
    });
  });

  // 专辑详情页返回
  document.getElementById('album-back-btn').addEventListener('click', () => {
    closePanel('album-panel');
  });

  // 歌词页返回
  document.getElementById('song-back-btn').addEventListener('click', () => {
    closePanel('song-panel');
  });

  // 收藏/取消收藏按钮
  document.getElementById('song-fav-btn').addEventListener('click', () => {
    if (state.currentSong) {
      toggleFavorite(state.currentSong.id);
    }
  });

  // 隐藏/显示黑胶唱片
  document.getElementById('toggle-cd-btn').addEventListener('click', () => {
    const cdSection = document.getElementById('cd-section');
    const toggleBtn = document.getElementById('toggle-cd-btn');
    state.showCD = !state.showCD;
    
    if (state.showCD) {
      cdSection.style.display = 'flex';
      toggleBtn.textContent = '隐藏唱片';
    } else {
      cdSection.style.display = 'none';
      toggleBtn.textContent = '显示唱片';
    }
  });

  // 搜索输入监听 (防抖处理)
  let searchTimeout;
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  // 回车键直接保存搜索词
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const val = searchInput.value.trim();
      if (val) {
        saveSearchHistory(val);
      }
      searchInput.blur(); // 失去焦点，收起虚拟键盘
    }
  });

  // 大家都在搜的快捷标签点击
  const tagItems = document.querySelectorAll('#suggestions-list .tag-item');
  tagItems.forEach(tag => {
    tag.addEventListener('click', () => {
      const query = tag.dataset.query;
      searchInput.value = query;
      clearSearchBtn.style.display = 'flex';
      performSearch(query);
      saveSearchHistory(query);
    });
  });

  // 清除历史记录按钮点击
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      clearSearchHistory();
    });
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query) {
      clearSearchBtn.style.display = 'flex';
    } else {
      clearSearchBtn.style.display = 'none';
      performSearch(''); // 清空展现历史和推荐
    }
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    performSearch('');
  });

  // 检索类型过滤按钮监听
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentSearchType = btn.dataset.type;
      performSearch(searchInput.value.trim());
    });
  });

  // 精准匹配开关监听
  const exactMatchSwitch = document.getElementById('exact-match-switch');
  if (exactMatchSwitch) {
    exactMatchSwitch.addEventListener('change', (e) => {
      try {
        state.isExactMatch = e.target.checked;
        const searchInputEl = document.getElementById('search-input');
        const queryVal = searchInputEl ? searchInputEl.value.trim() : '';
        performSearch(queryVal);
      } catch (err) {
        alert("开关切换出错: " + err.message + "\n" + err.stack);
        console.error("Exact match change error:", err);
      }
    });
  }

  // 侧滑关闭面板手势适配 (iOS Safari 体验增强)
  setupSwipeToClose('album-panel', 'right');
  setupSwipeToClose('song-panel', 'down');

  // 生成歌词卡片分享
  document.getElementById('song-share-btn').addEventListener('click', () => {
    if (state.selectedLyrics.length === 0) {
      showToast('请在歌词列表中，点击选择几句你喜欢的歌词');
      return;
    }
    if (state.selectedLyrics.length > 8) {
      showToast('最多选择8句歌词，排版更美观哦');
      return;
    }
    openShareModal();
  });

  // 关闭分享海报
  document.getElementById('poster-cancel-btn').addEventListener('click', () => {
    document.getElementById('share-modal').classList.remove('open');
  });

  // 复制/保存海报卡片
  document.getElementById('poster-copy-btn').addEventListener('click', () => {
    savePosterAsImage();
  });
}

// 5. 渲染模块
// 渲染主专辑列表
function renderAlbums() {
  const container = document.getElementById('albums-container');
  container.innerHTML = '';

  state.albums.forEach(album => {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.innerHTML = `
      <div class="album-cover-wrapper">
        <img class="album-cover" src="${album.cover}" alt="${album.name}" loading="lazy">
      </div>
      <div class="album-info">
        <div class="album-name">${album.name}</div>
        <div class="album-year">${album.year} 年</div>
      </div>
    `;
    card.addEventListener('click', () => {
      openAlbumDetail(album);
    });
    container.appendChild(card);
  });
}

// 页面 Tab 切换
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // 更新导航激活状态
  document.querySelectorAll('.tab-item').forEach(item => {
    if (item.dataset.tab === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 更新内容区域显示
  document.querySelectorAll('.tab-content').forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // 切换到收藏 Tab 时更新渲染
  if (tabId === 'favorites') {
    renderFavorites();
  }
}

// 6. 专辑详情面板逻辑
function openAlbumDetail(album) {
  document.getElementById('album-panel-title').textContent = album.name;
  document.getElementById('album-detail-cover').src = album.cover;
  document.getElementById('album-detail-name').textContent = album.name;
  document.getElementById('album-detail-desc').textContent = `${album.year} 年发行 • 共 ${album.songs.length} 首歌曲`;

  const songListContainer = document.getElementById('album-songs-container');
  songListContainer.innerHTML = '';

  album.songs.forEach((song, idx) => {
    const songRow = document.createElement('div');
    songRow.className = 'song-item';
    
    const isFav = state.favorites.includes(song.id);
    
    songRow.innerHTML = `
      <div class="song-index">${idx + 1}</div>
      <div class="song-title-wrapper">
        <div class="song-title">${song.name}</div>
        <div class="song-album-name">${album.name}</div>
      </div>
      <button class="song-action-btn fav ${isFav ? 'active' : ''}" data-song-id="${song.id}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </button>
    `;

    // 点击行打开歌词页
    songRow.addEventListener('click', (e) => {
      // 避免点击收藏按钮时误触行点击
      if (e.target.closest('.fav')) {
        e.stopPropagation();
        toggleFavorite(song.id);
        const favBtn = songRow.querySelector('.fav');
        favBtn.classList.toggle('active');
        return;
      }
      openSongLyrics(song);
    });

    songListContainer.appendChild(songRow);
  });

  const panel = document.getElementById('album-panel');
  panel.classList.add('open');
}

// 7. 歌词详情面板逻辑
function openSongLyrics(song, highlightKeyword = '') {
  state.currentSong = song;
  state.selectedLyrics = []; // 重置选中的歌词

  document.getElementById('song-header-title').textContent = song.name;
  document.getElementById('song-header-album').textContent = `专辑：《${song.albumName}》 (${song.year})`;
  const creditsEl = document.getElementById('song-header-credits');
  if (creditsEl) {
    creditsEl.textContent = `歌手：${song.singer || '周杰伦'}  |  词：${song.lyricist || '周杰伦'}  |  曲：${song.composer || '周杰伦'}`;
  }
  document.getElementById('song-cd-cover').src = encodeURI(song.cover);
  
  // 设置背景模糊氛围
  const backdrop = document.getElementById('song-backdrop');
  backdrop.style.backgroundImage = `url('${encodeURI(song.cover)}')`;

  // 更新收藏状态图标
  const favBtn = document.getElementById('song-fav-btn');
  if (state.favorites.includes(song.id)) {
    favBtn.classList.add('active');
  } else {
    favBtn.classList.remove('active');
  }

  // 渲染歌词
  const lyricsWrapper = document.getElementById('lyrics-wrapper');
  lyricsWrapper.innerHTML = '';

  let highlightedElement = null;

  if (song.songLrc && song.songLrc.length > 0) {
    song.songLrc.forEach((line, index) => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'lyric-line';
      
      // 处理检索高亮匹配
      let displayHtml = escapeHtml(line);
      let isLineMatched = false;

      if (highlightKeyword) {
        const escapedKeyword = escapeRegExp(highlightKeyword);
        const regex = new RegExp(`(${escapedKeyword})`, 'gi');
        if (regex.test(line)) {
          displayHtml = line.replace(regex, '<span class="highlight">$1</span>');
          isLineMatched = true;
        }
      }

      lineDiv.innerHTML = displayHtml;
      lineDiv.dataset.index = index;
      lineDiv.dataset.content = line;

      // 如果有匹配，则高亮本行背景并记录用于滚动定位
      if (isLineMatched) {
        lineDiv.classList.add('highlight-line');
        if (!highlightedElement) {
          highlightedElement = lineDiv;
        }
      }

      // 歌词点击事件：选择用于卡片分享
      lineDiv.addEventListener('click', () => {
        toggleSelectLyricLine(lineDiv, line);
      });

      lyricsWrapper.appendChild(lineDiv);
    });
  } else {
    lyricsWrapper.innerHTML = '<div class="lyric-line" style="color:var(--text-muted)">纯音乐，无歌词</div>';
  }

  const songPanel = document.getElementById('song-panel');
  songPanel.classList.add('open');

  // 自动滚动到匹配的歌词行，或者顶部
  setTimeout(() => {
    const container = document.getElementById('lyrics-container');
    if (highlightedElement) {
      const offsetTop = highlightedElement.offsetTop;
      container.scrollTo({
        top: offsetTop - container.clientHeight / 2 + 30,
        behavior: 'smooth'
      });
    } else {
      container.scrollTo({ top: 0 });
    }
  }, 350);
}

// 选择/取消选择歌词行
function toggleSelectLyricLine(element, lineContent) {
  const idx = state.selectedLyrics.indexOf(lineContent);
  if (element.classList.contains('selected-line')) {
    element.classList.remove('selected-line');
    if (idx > -1) {
      state.selectedLyrics.splice(idx, 1);
    }
  } else {
    if (state.selectedLyrics.length >= 8) {
      showToast('最多只能选择 8 句歌词生成分享卡片哦~');
      return;
    }
    element.classList.add('selected-line');
    state.selectedLyrics.push(lineContent);
  }
}

// 8. 检索功能模块（模糊匹配和精准匹配）
function performSearch(query) {
  try {
    const container = document.getElementById('search-results-container');
    const summary = document.getElementById('search-results-summary');
    const emptyState = document.getElementById('search-empty-state');

    if (!container) {
      console.warn("search-results-container DOM element is not ready yet.");
      return;
    }

    if (!query) {
      container.innerHTML = '';
      if (summary) summary.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      renderHistory(); // 展现历史搜索
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';

    const type = state.currentSearchType;
    const isExact = state.isExactMatch;

    // 匹配规则函数，支持拼音检索
    const matchString = (target, searchStr, pinyinTarget = '') => {
      if (target === undefined || target === null) return false;
      const cleanTarget = String(target).toLowerCase();
      const cleanSearch = String(searchStr).toLowerCase();
      const cleanPinyin = String(pinyinTarget).toLowerCase();
      
      if (isExact) {
        return cleanTarget === cleanSearch || (cleanPinyin && cleanPinyin === cleanSearch);
      } else {
        // 模糊检索：支持空格分词多重过滤
        const keywords = cleanSearch.split(/\s+/).filter(k => k.length > 0);
        if (keywords.length === 0) return false;
        return keywords.every(kw => cleanTarget.includes(kw) || (cleanPinyin && cleanPinyin.includes(kw)));
      }
    };

    let matchedAlbums = [];
    let matchedSongs = [];
    let matchedLyrics = []; // [{song: songObj, lines: [{text: '...', index: 0}]}]

    // [1] 专辑检索
    if (type === 'all' || type === 'album') {
      matchedAlbums = state.albums.filter(album => matchString(album.name, query));
    }

    // [2] 歌曲名检索（传入拼音辅助匹配）
    if (type === 'all' || type === 'song') {
      matchedSongs = state.flatSongs.filter(song => matchString(song.name, query, song.pinyinName));
    }

    // [3] 歌词内容检索
    if (type === 'all' || type === 'lyric') {
      state.flatSongs.forEach(song => {
        const matchingLines = [];
        song.songLrc.forEach((line, index) => {
          if (matchString(line, query)) {
            matchingLines.push({ text: line, index });
          }
        });
        if (matchingLines.length > 0) {
          matchedLyrics.push({
            song: song,
            lines: matchingLines
          });
        }
      });
    }

    let totalCount = matchedAlbums.length + matchedSongs.length + matchedLyrics.reduce((acc, curr) => acc + curr.lines.length, 0);
    if (summary) {
      summary.textContent = `找到约 ${totalCount} 条匹配结果`;
      summary.style.display = 'block';
    }

    // 渲染结果
    // (A) 渲染匹配的专辑
    if (matchedAlbums.length > 0) {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'search-result-group';
      groupDiv.innerHTML = `<div class="search-result-header">匹配的专辑 (${matchedAlbums.length})</div>`;
      
      matchedAlbums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        card.innerHTML = `
          <div class="search-result-title">
            <span>《${highlightText(album.name, query)}》</span>
            <span style="font-size:12px; color:var(--accent-color)">${album.year}</span>
          </div>
          <div class="search-result-meta">
            <span>共 ${album.songs.length} 首歌曲</span>
          </div>
        `;
        card.addEventListener('click', () => {
          saveSearchHistory(query); // 记录搜索词
          openAlbumDetail(album);
        });
        groupDiv.appendChild(card);
      });
      container.appendChild(groupDiv);
    }

    // (B) 渲染匹配的歌名
    if (matchedSongs.length > 0) {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'search-result-group';
      groupDiv.innerHTML = `<div class="search-result-header">匹配的歌曲 (${matchedSongs.length})</div>`;

      matchedSongs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        card.innerHTML = `
          <div class="search-result-title">${highlightText(song.name, query)}</div>
          <div class="search-result-meta">
            <span>专辑：${song.albumName}</span>
            <span>•</span>
            <span>年份：${song.year}</span>
          </div>
        `;
        card.addEventListener('click', () => {
          saveSearchHistory(query); // 记录搜索词
          openSongLyrics(song);
        });
        groupDiv.appendChild(card);
      });
      container.appendChild(groupDiv);
    }

    // (C) 渲染匹配的歌词
    if (matchedLyrics.length > 0) {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'search-result-group';
      groupDiv.innerHTML = `<div class="search-result-header">匹配的歌词 (${matchedLyrics.length} 首歌曲中包含)</div>`;

      matchedLyrics.forEach(item => {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        
        let linesHtml = '';
        const displayLines = item.lines.slice(0, 3);
        displayLines.forEach(line => {
          linesHtml += `
            <div class="matched-lyric-line">
              “ ${highlightText(line.text, query)} ”
            </div>
          `;
        });

        if (item.lines.length > 3) {
          linesHtml += `<div style="font-size:11px; color:var(--text-muted); padding-left:6px; margin-top:2px;">还有其他 ${item.lines.length - 3} 处匹配...</div>`;
        }

        card.innerHTML = `
          <div class="search-result-title">
            <span>${item.song.name}</span>
            <span style="font-size:11px; font-weight:normal; color:var(--text-secondary)">${item.song.albumName}</span>
          </div>
          <div class="matched-lyrics">
            ${linesHtml}
          </div>
        `;
        
        card.addEventListener('click', () => {
          saveSearchHistory(query); // 记录搜索词
          openSongLyrics(item.song, query);
        });
        groupDiv.appendChild(card);
      });
      container.appendChild(groupDiv);
    }

    // 无结果展示
    if (totalCount === 0) {
      const noResult = document.createElement('div');
      noResult.className = 'empty-state';
      noResult.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        <div class="empty-title">无匹配结果</div>
        <div class="empty-desc">换个词再试一下吧</div>
      `;
      container.appendChild(noResult);
    }
  } catch (err) {
    alert("搜索执行出错: " + err.message + "\n" + err.stack);
    console.error("搜索执行出错:", err);
  }
}

// 文本高亮工具函数
function highlightText(text, keyword) {
  if (!text || !keyword || state.isExactMatch) return escapeHtml(text);
  const cleanKeyword = keyword.toLowerCase();
  
  // 支持分词高亮
  const keywords = cleanKeyword.split(/\s+/).filter(k => k.length > 0);
  if (keywords.length === 0) return escapeHtml(text);

  let tempHtml = escapeHtml(text);
  
  // 分词依次高亮，为避免重复替换破坏HTML标签，使用临时占位标记
  keywords.forEach((kw, index) => {
    const escapedKw = escapeRegExp(kw);
    const regex = new RegExp(`(${escapedKw})`, 'gi');
    tempHtml = tempHtml.replace(regex, `##HL_START_${index}##$1##HL_END_${index}##`);
  });

  // 替换占位标记为真正的 HTML
  keywords.forEach((kw, index) => {
    const startRegex = new RegExp(`##HL_START_${index}##`, 'g');
    const endRegex = new RegExp(`##HL_END_${index}##`, 'g');
    tempHtml = tempHtml.replace(startRegex, '<span class="highlight">').replace(endRegex, '</span>');
  });

  return tempHtml;
}

// 9. 收藏逻辑模块
function renderFavorites() {
  const container = document.getElementById('favorites-container');
  const emptyState = document.getElementById('favorites-empty-state');
  container.innerHTML = '';

  const favSongs = state.flatSongs.filter(song => state.favorites.includes(song.id));

  if (favSongs.length === 0) {
    emptyState.style.display = 'flex';
    container.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  container.style.display = 'flex';

  favSongs.forEach((song, idx) => {
    const songRow = document.createElement('div');
    songRow.className = 'song-item';
    songRow.innerHTML = `
      <div class="song-index">${idx + 1}</div>
      <div class="song-title-wrapper">
        <div class="song-title">${song.name}</div>
        <div class="song-album-name">${song.albumName}</div>
      </div>
      <button class="song-action-btn fav active">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </button>
    `;

    songRow.addEventListener('click', (e) => {
      if (e.target.closest('.fav')) {
        e.stopPropagation();
        toggleFavorite(song.id);
        renderFavorites(); // 重新渲染列表
        return;
      }
      openSongLyrics(song);
    });

    container.appendChild(songRow);
  });
}

function toggleFavorite(songId) {
  const idx = state.favorites.indexOf(songId);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
    showToast('已取消收藏');
  } else {
    state.favorites.push(songId);
    showToast('已加入收藏');
  }
  saveFavorites();

  // 动态更新歌曲列表或搜索结果里匹配的按钮样式
  const btn = document.getElementById('song-fav-btn');
  if (btn && state.currentSong && state.currentSong.id === songId) {
    btn.classList.toggle('active');
  }
}

// 10. 歌词分享卡片生成 (使用 Canvas 绘制高解析海报，完美支持 iOS 长按保存)
function openShareModal() {
  const modal = document.getElementById('share-modal');
  const song = state.currentSong;
  
  document.getElementById('poster-cover').src = song.cover;
  document.getElementById('poster-song-name').textContent = song.name;

  const container = document.getElementById('poster-lyrics-container');
  container.innerHTML = '';
  state.selectedLyrics.forEach(line => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'poster-lyric-line';
    lineDiv.textContent = line;
    container.appendChild(lineDiv);
  });

  // 在后台用 Canvas 预先绘制，生成可供长按保存的图片
  renderPosterToCanvas();

  modal.classList.add('open');
}

function renderPosterToCanvas() {
  const song = state.currentSong;
  const lyrics = state.selectedLyrics;
  const posterArea = document.getElementById('poster-area');

  const oldImg = document.getElementById('generated-poster-img');
  if (oldImg) oldImg.remove();
  posterArea.classList.remove('has-generated');
  
  // 创建 Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 按照高分屏 (2x Retina) 设置尺寸，防止导出图片模糊
  const width = 640;
  const lineGap = 36;
  const baseHeight = 360;
  const height = baseHeight + (lyrics.length * lineGap);
  
  canvas.width = width;
  canvas.height = height;
  
  // 1. 绘制背景：神秘暗夜深色
  ctx.fillStyle = '#121215';
  ctx.fillRect(0, 0, width, height);

  // 2. 加载封面图片并绘制模糊背景氛围
  const coverImg = new Image();
  coverImg.crossOrigin = "anonymous";
  coverImg.src = song.cover;
  
  coverImg.onload = () => {
    // 绘制封面背景氛围（提高透明度至 0.45，确保暗色封面细节可见）
    ctx.save();
    ctx.globalAlpha = 0.45;
    drawImageCover(ctx, coverImg, -50, -50, width + 100, height + 100);
    ctx.restore();

    // 在其上叠加一层 75% 不透明度的暗夜色，压低亮度，使其既显露轮廓又保持高级感
    ctx.fillStyle = 'rgba(18, 18, 21, 0.75)';
    ctx.fillRect(0, 0, width, height);

    // 绘制磨砂玻璃边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    
    // 3. 绘制封面缩略图 (圆角)
    ctx.save();
    const coverSize = 96;
    const coverX = 40;
    const coverY = 40;
    const radius = 16;
    
    // 裁剪圆角
    ctx.beginPath();
    ctx.moveTo(coverX + radius, coverY);
    ctx.lineTo(coverX + coverSize - radius, coverY);
    ctx.quadraticCurveTo(coverX + coverSize, coverY, coverX + coverSize, coverY + radius);
    ctx.lineTo(coverX + coverSize, coverY + coverSize - radius);
    ctx.quadraticCurveTo(coverX + coverSize, coverY + coverSize, coverX + coverSize - radius, coverY + coverSize);
    ctx.lineTo(coverX + radius, coverY + coverSize);
    ctx.quadraticCurveTo(coverX, coverY + coverSize, coverX, coverY + coverSize - radius);
    ctx.lineTo(coverX, coverY + radius);
    ctx.quadraticCurveTo(coverX, coverY, coverX + radius, coverY);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(coverImg, coverX, coverY, coverSize, coverSize);
    ctx.restore();

    // 4. 绘制歌曲、歌手及专辑文本信息
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
    ctx.fillText(song.name, 160, 72);
    
    ctx.fillStyle = '#9898a0';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`专辑：《${song.albumName}》 (${song.year})`, 160, 102);
    ctx.fillText(`歌手：${song.singer || '周杰伦'}   词：${song.lyricist || '周杰伦'}   曲：${song.composer || '周杰伦'}`, 160, 130);

    // 5. 绘制分割装饰线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 180);
    ctx.lineTo(width - 40, 180);
    ctx.stroke();

    // 6. 绘制选中的歌词内容 (左侧带金黄色竖装饰线)
    // 绘制装饰竖线
    ctx.strokeStyle = '#e5c158';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, 220);
    ctx.lineTo(40, 220 + (lyrics.length * lineGap) - 10);
    ctx.stroke();

    ctx.fillStyle = '#f0f0f5';
    ctx.font = 'medium 24px -apple-system, BlinkMacSystemFont, sans-serif';
    
    lyrics.forEach((line, i) => {
      ctx.fillText(line, 60, 240 + (i * lineGap));
    });

    // 7. 绘制底部 LOGO 及二维码/截图提示
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(40, height - 80);
    ctx.lineTo(width - 40, height - 80);
    ctx.stroke();

    // JAY CHOU LOGO 渐变字
    const gradient = ctx.createLinearGradient(40, 0, 200, 0);
    gradient.addColorStop(0, '#e5c158');
    gradient.addColorStop(1, '#ff8a00');
    ctx.fillStyle = gradient;
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('JAY CHOU LYRICS', 40, height - 40);

    // 8. 核心步骤：将 Canvas 转成 Base64 Image 并覆盖在卡片容器上，供 iOS 原生长按下载！
    const imgDataUrl = canvas.toDataURL('image/png');
    
    const generatedImg = document.createElement('img');
    generatedImg.id = 'generated-poster-img';
    generatedImg.src = imgDataUrl;
    generatedImg.style.width = '100%';
    generatedImg.style.height = 'auto';
    generatedImg.style.display = 'block';
    generatedImg.style.pointerEvents = 'auto'; // 关键：允许用户交互长按！

    posterArea.classList.add('has-generated');
    posterArea.appendChild(generatedImg);
  };
}

function drawImageCover(ctx, img, x, y, width, height) {
  try {
    const imgWidth = img.naturalWidth || img.width || 300;
    const imgHeight = img.naturalHeight || img.height || 300;
    const scale = Math.max(width / imgWidth, height / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  } catch (e) {
    console.error("drawImageCover error:", e);
    ctx.drawImage(img, x, y, width, height);
  }
}

function savePosterAsImage() {
  const img = document.getElementById('generated-poster-img');
  if (!img) {
    showToast('图片尚未绘制完成，请稍候');
    return;
  }

  // 尝试使用最新的 Web Share API 或者是传统的下载链接
  try {
    const link = document.createElement('a');
    link.download = `周杰伦-${state.currentSong.name}-歌词分享.png`;
    link.href = img.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('已触发保存，或长按卡片直接存储');
  } catch (e) {
    showToast('请直接长按图片进行保存');
  }
}

// 11. 手势检测辅助函数 (侧滑返回，丝滑顺手)
function setupSwipeToClose(panelId, direction = 'right') {
  const panel = document.getElementById(panelId);
  if (!panel) return; // 强力防护
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  panel.addEventListener('touchstart', (e) => {
    // 忽略歌词滚动区域的滑动
    if (e.target.closest('.lyrics-container')) return;
    
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  panel.addEventListener('touchend', (e) => {
    if (e.target.closest('.lyrics-container')) return;

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
  }, { passive: true });

  function handleGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (direction === 'right' && deltaX > 100 && Math.abs(deltaY) < 60) {
      // 从左向右划
      closePanel(panelId);
    } else if (direction === 'down' && deltaY > 100 && Math.abs(deltaX) < 60) {
      // 从上向下划
      closePanel(panelId);
    }
  }
}

function closePanel(panelId) {
  const panel = document.getElementById(panelId);
  panel.classList.remove('open');
  
  if (panelId === 'song-panel') {
    // 如果关闭了歌词页面，清空所选歌词
    state.selectedLyrics = [];
    document.querySelectorAll('.lyric-line').forEach(line => {
      line.classList.remove('selected-line');
    });
  }
}

// 12. 辅助工具函数
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
