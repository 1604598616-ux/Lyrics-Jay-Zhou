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

const PINYIN_MAP = {
  "浪漫手机": {
    "initials": "lmsj",
    "full": "langmanshouji"
  },
  "方文山": {
    "initials": "fws",
    "full": "fangwenshan"
  },
  "周杰伦": {
    "initials": "zjl",
    "full": "zhoujielun"
  },
  "漂移": {
    "initials": "py",
    "full": "piaoyi"
  },
  "一路向北": {
    "initials": "ylxb",
    "full": "yiluxiangbei"
  },
  "枫": {
    "initials": "f",
    "full": "feng"
  },
  "宋健彰": {
    "initials": "sjz",
    "full": "songjianzhang"
  },
  "黑色毛衣": {
    "initials": "hsmy",
    "full": "heisemaoyi"
  },
  "麦芽糖": {
    "initials": "myt",
    "full": "maiyatang"
  },
  "夜曲": {
    "initials": "yq",
    "full": "yequ"
  },
  "发如雪": {
    "initials": "frx",
    "full": "faruxue"
  },
  "蓝色风暴": {
    "initials": "lsfb",
    "full": "lansefengbao"
  },
  "珊瑚海": {
    "initials": "shh",
    "full": "shanhuhai"
  },
  "四面楚歌": {
    "initials": "smcg",
    "full": "simianchuge"
  },
  "逆鳞": {
    "initials": "nl",
    "full": "nilin"
  },
  "黄俊郎": {
    "initials": "hjl",
    "full": "huangjunlang"
  },
  "东风破": {
    "initials": "dfp",
    "full": "dongfengpo"
  },
  "三年二班": {
    "initials": "sneb",
    "full": "sannianerban"
  },
  "晴天": {
    "initials": "qt",
    "full": "qingtian"
  },
  "你听得到": {
    "initials": "ntdd",
    "full": "nitingdedao"
  },
  "曾郁婷": {
    "initials": "zyt",
    "full": "zengyuting"
  },
  "同一种调调": {
    "initials": "tyztt",
    "full": "tongyizhongtiaotiao"
  },
  "她的睫毛": {
    "initials": "tdjm",
    "full": "tadejiemao"
  },
  "以父之名": {
    "initials": "yfzm",
    "full": "yifuzhiming"
  },
  "爱情悬崖": {
    "initials": "aqxy",
    "full": "aiqingxuanya"
  },
  "徐若瑄": {
    "initials": "xrx",
    "full": "xuruoxuan"
  },
  "懦夫": {
    "initials": "nf",
    "full": "nuofu"
  },
  "梯田": {
    "initials": "tt",
    "full": "titian"
  },
  "双刀": {
    "initials": "sd",
    "full": "shuangdao"
  },
  "给我一首歌的时间": {
    "initials": "gwysgdsj",
    "full": "geiwoyishougedeshijian"
  },
  "乔克叔叔": {
    "initials": "qkss",
    "full": "qiaokeshushu"
  },
  "时光机": {
    "initials": "sgj",
    "full": "shiguangji"
  },
  "说好的幸福呢": {
    "initials": "shdxfn",
    "full": "shuohaodexingfune"
  },
  "稻香": {
    "initials": "dx",
    "full": "daoxiang"
  },
  "龙战骑士": {
    "initials": "lzqs",
    "full": "longzhanqishi"
  },
  "花海": {
    "initials": "hh",
    "full": "huahai"
  },
  "古小力/黄淩嘉": {
    "initials": "gxlhlj",
    "full": "guxiaolihuanglingjia"
  },
  "蛇舞": {
    "initials": "sw",
    "full": "shewu"
  },
  "兰亭序": {
    "initials": "ltx",
    "full": "lantingxu"
  },
  "流浪诗人": {
    "initials": "llsr",
    "full": "liulangshiren"
  },
  "魔术先生": {
    "initials": "msxs",
    "full": "moshuxiansheng"
  },
  "火车叨位去": {
    "initials": "hctwq",
    "full": "huochetaoweiqu"
  },
  "回到过去": {
    "initials": "hdgq",
    "full": "huidaoguoqu"
  },
  "刘畊宏": {
    "initials": "lgh",
    "full": "liugenghong"
  },
  "爷爷泡的茶": {
    "initials": "yypdc",
    "full": "yeyepaodecha"
  },
  "半兽人": {
    "initials": "bsr",
    "full": "banshouren"
  },
  "暗号": {
    "initials": "ah",
    "full": "anhao"
  },
  "许世昌": {
    "initials": "xsc",
    "full": "xushichang"
  },
  "最后的战役": {
    "initials": "zhdzy",
    "full": "zuihoudezhanyi"
  },
  "龙拳": {
    "initials": "lq",
    "full": "longquan"
  },
  "米兰的小铁匠": {
    "initials": "mldxtj",
    "full": "milandexiaotiejiang"
  },
  "分裂": {
    "initials": "fl",
    "full": "fenlie"
  },
  "半岛铁盒": {
    "initials": "bdth",
    "full": "bandaotiehe"
  },
  "哪里都是你": {
    "initials": "nldsn",
    "full": "nalidushini"
  },
  "公公偏头痛": {
    "initials": "ggptt",
    "full": "gonggongpiantoutong"
  },
  "手语": {
    "initials": "sy",
    "full": "shouyu"
  },
  "乌克丽丽": {
    "initials": "wkll",
    "full": "wukelili"
  },
  "红尘客栈": {
    "initials": "hckz",
    "full": "hongchenkezhan"
  },
  "梦想启动": {
    "initials": "mxqd",
    "full": "mengxiangqidong"
  },
  "林义杰": {
    "initials": "lyj",
    "full": "linyijie"
  },
  "四季列车": {
    "initials": "sjlc",
    "full": "sijilieche"
  },
  "大笨钟": {
    "initials": "dbz",
    "full": "dabenzhong"
  },
  "爱你没差": {
    "initials": "anmc",
    "full": "ainimeicha"
  },
  "黄淩嘉": {
    "initials": "hlj",
    "full": "huanglingjia"
  },
  "傻笑": {
    "initials": "sx",
    "full": "shaxiao"
  },
  "明明就": {
    "initials": "mmj",
    "full": "mingmingjiu"
  },
  "比较大的大提琴": {
    "initials": "bjdddtq",
    "full": "bijiaodadedatiqin"
  },
  "七里香": {
    "initials": "qlx",
    "full": "qilixiang"
  },
  "外婆": {
    "initials": "wp",
    "full": "waipo"
  },
  "困兽之斗": {
    "initials": "kszd",
    "full": "kunshouzhidou"
  },
  "我的地盘": {
    "initials": "wddp",
    "full": "wodedipan"
  },
  "借口": {
    "initials": "jk",
    "full": "jiekou"
  },
  "园游会": {
    "initials": "yyh",
    "full": "yuanyouhui"
  },
  "止战之殇": {
    "initials": "zzzs",
    "full": "zhizhanzhishang"
  },
  "乱舞春秋": {
    "initials": "lwcq",
    "full": "luanwuchunqiu"
  },
  "将军": {
    "initials": "jj",
    "full": "jiangjun"
  },
  "搁浅": {
    "initials": "gq",
    "full": "geqian"
  },
  "惊叹号": {
    "initials": "jth",
    "full": "jingtanhao"
  },
  "公主病": {
    "initials": "gzb",
    "full": "gongzhubing"
  },
  "琴伤": {
    "initials": "qs",
    "full": "qinshang"
  },
  "Mine Mine": {
    "initials": "minemine",
    "full": "minemine"
  },
  "皮影戏": {
    "initials": "pyx",
    "full": "piyingxi"
  },
  "唐从圣": {
    "initials": "tcs",
    "full": "tangcongsheng"
  },
  "超跑女神": {
    "initials": "cpns",
    "full": "chaopaonvshen"
  },
  "水手怕水": {
    "initials": "ssps",
    "full": "shuishoupashui"
  },
  "世界未末日": {
    "initials": "sjwmr",
    "full": "shijieweimori"
  },
  "迷魂曲": {
    "initials": "mhq",
    "full": "mihunqu"
  },
  "你好吗": {
    "initials": "nhm",
    "full": "nihaoma"
  },
  "罗宇轩/李汪哲": {
    "initials": "lyxlwz",
    "full": "luoyuxuanliwangzhe"
  },
  "疗伤烧肉粽": {
    "initials": "lssrz",
    "full": "liaoshangshaorouzong"
  },
  "免费教学录影带": {
    "initials": "mfjxlyd",
    "full": "mianfeijiaoxueluyingdai"
  },
  "爱的飞行日记": {
    "initials": "adfhrj",
    "full": "aidefeihangriji"
  },
  "嘻哈空姐": {
    "initials": "xhkj",
    "full": "xihakongjie"
  },
  "超人不会飞": {
    "initials": "crbhf",
    "full": "chaorenbuhuifei"
  },
  "自导自演": {
    "initials": "zdzy",
    "full": "zidaoziyan"
  },
  "跨时代": {
    "initials": "ksd",
    "full": "kuashidai"
  },
  "说了再见": {
    "initials": "slzj",
    "full": "shuolezaijian"
  },
  "烟花易冷": {
    "initials": "yhyl",
    "full": "yanhuayileng"
  },
  "我落泪": {
    "initials": "wll",
    "full": "woluolei"
  },
  "雨下一整晚": {
    "initials": "yxyzw",
    "full": "yuxiayizhengwan"
  },
  "好久不见": {
    "initials": "hjbj",
    "full": "haojiubujian"
  },
  "最长的电影": {
    "initials": "zcddy",
    "full": "zuichangdedianying"
  },
  "甜甜的": {
    "initials": "ttd",
    "full": "tiantiande"
  },
  "青花瓷": {
    "initials": "qhc",
    "full": "qinghuaci"
  },
  "我不配": {
    "initials": "wbp",
    "full": "wobupei"
  },
  "牛仔很忙": {
    "initials": "nzhm",
    "full": "niuzihenmang"
  },
  "无双": {
    "initials": "ws",
    "full": "wushuang"
  },
  "彩虹": {
    "initials": "ch",
    "full": "caihong"
  },
  "阳光宅男": {
    "initials": "ygzn",
    "full": "yangguangzhainan"
  },
  "蒲公英的约定": {
    "initials": "pgydyd",
    "full": "pugongyingdeyueding"
  },
  "扯": {
    "initials": "c",
    "full": "che"
  },
  "听妈妈的话": {
    "initials": "tmmdh",
    "full": "tingmamadehua"
  },
  "菊花台": {
    "initials": "jht",
    "full": "juhuatai"
  },
  "退后": {
    "initials": "th",
    "full": "tuihou"
  },
  "本草纲目": {
    "initials": "bcgm",
    "full": "bencaogangmu"
  },
  "夜的第七章": {
    "initials": "yddqz",
    "full": "yedediqizhang"
  },
  "迷迭香": {
    "initials": "mdx",
    "full": "midiexiang"
  },
  "千里之外": {
    "initials": "qlzw",
    "full": "qianlizhiwai"
  },
  "心雨": {
    "initials": "xy",
    "full": "xinyu"
  },
  "红模仿": {
    "initials": "hmf",
    "full": "hongmofang"
  },
  "白色风车": {
    "initials": "bsfc",
    "full": "baisefengche"
  },
  "反方向的钟": {
    "initials": "ffxdz",
    "full": "fanfangxiangdezhong"
  },
  "印地安老斑鸠": {
    "initials": "ydalbj",
    "full": "yindianlaobanjiu"
  },
  "完美主义": {
    "initials": "wmzy",
    "full": "wanmeizhuyi"
  },
  "黑色幽默": {
    "initials": "hsym",
    "full": "heiseyoumo"
  },
  "可爱女人": {
    "initials": "kanr",
    "full": "keainvren"
  },
  "伊斯坦堡": {
    "initials": "ystb",
    "full": "yisitanbao"
  },
  "斗牛": {
    "initials": "dn",
    "full": "douniu"
  },
  "娘子": {
    "initials": "nz",
    "full": "niangzi"
  },
  "龙卷风": {
    "initials": "ljf",
    "full": "longjuanfeng"
  },
  "星晴": {
    "initials": "xq",
    "full": "xingqing"
  },
  "简单爱": {
    "initials": "jda",
    "full": "jiandanai"
  },
  "对不起": {
    "initials": "dbq",
    "full": "duibuqi"
  },
  "忍者": {
    "initials": "rz",
    "full": "renzhe"
  },
  "上海一九四三": {
    "initials": "shyjss",
    "full": "shanghaiyijiusisan"
  },
  "开不了口": {
    "initials": "kblk",
    "full": "kaibulekou"
  },
  "爸我回来了": {
    "initials": "bwhll",
    "full": "bawohuilaile"
  },
  "威廉古堡": {
    "initials": "wlgb",
    "full": "weiliangubao"
  },
  "爱在西元前": {
    "initials": "azxyq",
    "full": "aizaixiyuanqian"
  },
  "双截棍": {
    "initials": "sjg",
    "full": "shuangjiegun"
  },
  "安静": {
    "initials": "aj",
    "full": "anjing"
  }
};

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
  favorites: [],     // 收藏的歌曲唯一ID对象数组 (前向兼容)
  searchHistory: [], // 历史搜索记录
  activeTab: 'albums',
  currentSong: null,
  selectedLyrics: [], // 当前选中的歌词行内容数组
  currentSearchType: 'all', // 'all', 'album', 'song', 'lyric'
  isExactMatch: false,
  showCD: true,
  lyricsFontSize: 16, // 默认歌词字号 px
  currentPlaylist: [], // 当前切歌上下文列表
  favoritesSort: 'default' // 收藏排序规则: 'default', 'time-desc', 'time-asc'
};

// 3. 初始化入口
document.addEventListener('DOMContentLoaded', () => {
  initData();
  loadFavorites();
  loadSearchHistory();
  // 读取字号缓存
  const savedFontSize = localStorage.getItem('jay_lyrics_font_size');
  if (savedFontSize) {
    state.lyricsFontSize = parseInt(savedFontSize);
  }
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
          pinyinName: getPinyinInitials(song.name),
          fullPinyinName: getPinyinFull(song.name),
          pinyinLyricist: getPinyinInitials(song.lyricist || "周杰伦"),
          fullPinyinLyricist: getPinyinFull(song.lyricist || "周杰伦"),
          pinyinComposer: getPinyinInitials(song.composer || "周杰伦"),
          fullPinyinComposer: getPinyinFull(song.composer || "周杰伦"),
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
  
  // 按照年份对专辑排序
  state.albums.sort((a, b) => parseInt(a.year) - parseInt(b.year));
}

function getPinyinInitials(str) {
  if (typeof str !== 'string') return '';
  return PINYIN_MAP[str] ? PINYIN_MAP[str].initials : '';
}

function getPinyinFull(str) {
  if (typeof str !== 'string') return '';
  return PINYIN_MAP[str] ? PINYIN_MAP[str].full : '';
}

function loadFavorites() {
  try {
    const saved = localStorage.getItem('jay_lyrics_favorites');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // 前向兼容性转换：将老版本的字符串格式自动转换升级为带时间戳的对象格式
        state.favorites = parsed.map(item => {
          if (typeof item === 'string') {
            return { id: item, time: Date.now() };
          }
          return item;
        });
      }
    }
  } catch (e) {
    console.error('加载收藏夹失败:', e);
  }
  // 强力保障：如果解析出来不是数组或者是 null，强制重置为空数组
  if (!Array.isArray(state.favorites)) {
    state.favorites = [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem('jay_lyrics_favorites', JSON.stringify(state.favorites));
  } catch (e) {
    console.error('保存收藏夹失败(当前协议或浏览器隐私设置可能限制写入localStorage):', e);
  }
}

function updateFavoriteButtonState() {
  const favBtn = document.getElementById('song-fav-btn');
  if (favBtn && state.currentSong) {
    const isFav = state.favorites.some(item => item.id === state.currentSong.id);
    if (isFav) {
      favBtn.classList.add('active');
    } else {
      favBtn.classList.remove('active');
    }
  }
}


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
      const clearBtn = document.getElementById('clear-search-btn');
      if (clearBtn) clearBtn.style.display = 'flex';
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
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      clearSearchBtn.style.display = 'none';
      clearTimeout(searchTimeout);
      performSearch(''); // 立即清空，恢复初始推荐和历史记录
    }
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

  // 绑定上一曲/下一曲按钮
  const prevBtn = document.getElementById('prev-song-btn');
  const nextBtn = document.getElementById('next-song-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      switchSongInPlaylist(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      switchSongInPlaylist(1);
    });
  }

  // 绑定字号加减按钮
  const fontDecBtn = document.getElementById('font-dec-btn');
  const fontIncBtn = document.getElementById('font-inc-btn');
  if (fontDecBtn) {
    fontDecBtn.addEventListener('click', () => {
      changeLyricsFontSize(-2);
    });
  }
  if (fontIncBtn) {
    fontIncBtn.addEventListener('click', () => {
      changeLyricsFontSize(2);
    });
  }

  // 绑定收藏页面排序下拉菜单触发
  const sortTriggerBtn = document.getElementById('sort-trigger-btn');
  const sortDropdownMenu = document.getElementById('sort-dropdown-menu');
  const sortDropdownOptions = document.querySelectorAll('.sort-dropdown-option');

  if (sortTriggerBtn && sortDropdownMenu) {
    sortTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止事件冒泡，防止触发全局关闭监听
      
      // 开启菜单时，高亮当前所选
      sortDropdownOptions.forEach(opt => {
        if (opt.dataset.sort === state.favoritesSort) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });
      
      sortDropdownMenu.classList.toggle('open');
    });
  }

  // 点击外部区域关闭下拉菜单
  document.addEventListener('click', (e) => {
    if (sortDropdownMenu && sortDropdownMenu.classList.contains('open')) {
      if (sortTriggerBtn && !sortTriggerBtn.contains(e.target) && !sortDropdownMenu.contains(e.target)) {
        sortDropdownMenu.classList.remove('open');
      }
    }
  });

  sortDropdownOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      sortDropdownOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      state.favoritesSort = opt.dataset.sort;
      renderFavorites();
      
      setTimeout(() => {
        if (sortDropdownMenu) sortDropdownMenu.classList.remove('open');
      }, 150);
    });
  });

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

  // 歌词行点击事件委托（分享选择）
  const lyricsWrapper = document.getElementById('lyrics-wrapper');
  if (lyricsWrapper) {
    lyricsWrapper.addEventListener('click', (e) => {
      const lineDiv = e.target.closest('.lyric-line');
      if (lineDiv && lineDiv.dataset.content) {
        const lineContent = lineDiv.dataset.content;
        toggleSelectLyricLine(lineDiv, lineContent);
      }
    });
  }
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
    
    const isFav = state.favorites.some(item => item.id === song.id);
    
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
function openSongLyrics(song, highlightKeyword = '', playlist = null) {
  state.currentSong = song;
  state.selectedLyrics = []; // 重置选中的歌词

  // 绑定切歌上下文播放列表
  if (playlist) {
    state.currentPlaylist = playlist;
  } else if (!state.currentPlaylist || state.currentPlaylist.length === 0) {
    state.currentPlaylist = state.flatSongs;
  }

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
  updateFavoriteButtonState();

  // 渲染歌词
  const lyricsWrapper = document.getElementById('lyrics-wrapper');
  let highlightedElement = null;

  if (song.songLrc && song.songLrc.length > 0) {
    let lyricsHtml = '';
    song.songLrc.forEach((line, index) => {
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

      const matchedClass = isLineMatched ? ' highlight-line' : '';
      lyricsHtml += `<div class="lyric-line${matchedClass}" data-index="${index}" data-content="${escapeHtml(line)}">${displayHtml}</div>`;
    });
    lyricsWrapper.innerHTML = lyricsHtml;

    if (highlightKeyword) {
      highlightedElement = lyricsWrapper.querySelector('.highlight-line');
    }
  } else {
    lyricsWrapper.innerHTML = '<div class="lyric-line" style="color:var(--text-muted)">纯音乐，无歌词</div>';
  }

  // 应用当前选中的字号
  applyLyricsFontSize();

  const songPanel = document.getElementById('song-panel');
  songPanel.classList.add('open');

  // 自动滚动到匹配的歌词行，或者顶部
  setTimeout(() => {
    const container = document.getElementById('lyrics-container');
    if (highlightedElement) {
      const containerHeight = container.clientHeight;
      const elementTop = highlightedElement.offsetTop;
      const elementHeight = highlightedElement.clientHeight;
      container.scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
    } else {
      container.scrollTop = 0;
    }
  }, 300);
}
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

    // 匹配规则函数，支持拼音首字母和全拼检索
    const matchString = (target, searchStr, pinyinTarget = '', fullPinyinTarget = '') => {
      if (target === undefined || target === null) return false;
      const cleanTarget = String(target).toLowerCase();
      const cleanSearch = String(searchStr).toLowerCase();
      const cleanPinyin = String(pinyinTarget).toLowerCase();
      const cleanFullPinyin = String(fullPinyinTarget).toLowerCase();
      
      if (isExact) {
        return cleanTarget === cleanSearch || 
               (cleanPinyin && cleanPinyin === cleanSearch) ||
               (cleanFullPinyin && cleanFullPinyin === cleanSearch);
      } else {
        // 模糊检索：支持空格分词多重过滤
        const keywords = cleanSearch.split(/\s+/).filter(k => k.length > 0);
        if (keywords.length === 0) return false;
        return keywords.every(kw => 
          cleanTarget.includes(kw) || 
          (cleanPinyin && cleanPinyin.includes(kw)) ||
          (cleanFullPinyin && cleanFullPinyin.includes(kw))
        );
      }
    };

    let matchedAlbums = [];
    let matchedSongs = [];
    let matchedLyrics = []; // [{song: songObj, lines: [{text: '...', index: 0}]}]

    // [1] 专辑检索
    if (type === 'all' || type === 'album') {
      matchedAlbums = state.albums.filter(album => matchString(album.name, query));
    }

    // [2] 歌曲名及作词/作曲人检索（传入拼音首字母与全拼辅助匹配）
    if (type === 'all' || type === 'song' || type === 'lyricist' || type === 'composer') {
      matchedSongs = state.flatSongs.filter(song => {
        if (type === 'lyricist') {
          return matchString(song.lyricist, query, song.pinyinLyricist, song.fullPinyinLyricist);
        }
        if (type === 'composer') {
          return matchString(song.composer, query, song.pinyinComposer, song.fullPinyinComposer);
        }
        if (type === 'song') {
          return matchString(song.name, query, song.pinyinName, song.fullPinyinName);
        }
        // type === 'all' 时，匹配歌曲名、作词人、作曲人
        return (
          matchString(song.name, query, song.pinyinName, song.fullPinyinName) ||
          matchString(song.lyricist, query, song.pinyinLyricist, song.fullPinyinLyricist) ||
          matchString(song.composer, query, song.pinyinComposer, song.fullPinyinComposer)
        );
      });
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
            <span>词：${highlightText(song.lyricist, query)}</span>
            <span>•</span>
            <span>曲：${highlightText(song.composer, query)}</span>
          </div>
        `;
        card.addEventListener('click', () => {
          saveSearchHistory(query); // 记录搜索词
          openSongLyrics(song, '', matchedSongs);
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
          const contextPlaylist = matchedLyrics.map(m => m.song);
          openSongLyrics(item.song, query, contextPlaylist);
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
  const sortBar = document.getElementById('favorites-sort-bar');
  if (!container || !emptyState) return;

  if (state.favorites.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    if (sortBar) sortBar.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  if (sortBar) sortBar.style.display = 'flex';
  container.innerHTML = '';

  // 进行排序分流
  let sortedFavorites = [...state.favorites];
  if (state.favoritesSort === 'time-desc') {
    sortedFavorites.sort((a, b) => b.time - a.time);
  } else if (state.favoritesSort === 'time-asc') {
    sortedFavorites.sort((a, b) => a.time - b.time);
  } else if (state.favoritesSort === 'album') {
    // 按专辑名称排序，专辑相同时按原本曲目顺序
    sortedFavorites.sort((a, b) => {
      const songA = state.flatSongs.find(s => s.id === a.id);
      const songB = state.flatSongs.find(s => s.id === b.id);
      if (!songA || !songB) return 0;
      const albumComp = songA.albumName.localeCompare(songB.albumName, 'zh');
      if (albumComp !== 0) return albumComp;
      return songA.index - songB.index;
    });
  } else {
    // 默认排序：按专辑和歌曲在全局 flatSongs 中的顺序
    const orderMap = {};
    state.flatSongs.forEach((song, index) => {
      orderMap[song.id] = index;
    });
    sortedFavorites.sort((a, b) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0));
  }

  // 渲染歌曲卡片
  sortedFavorites.forEach((item, idx) => {
    const song = state.flatSongs.find(s => s.id === item.id);
    if (!song) return;

    const card = document.createElement('div');
    card.className = 'song-item';
    card.innerHTML = `
      <div class="song-item-left">
        <div class="song-index">${idx + 1}</div>
        <div class="song-info">
          <div class="song-name-row">
            <span class="song-name">${song.name} - 《${song.albumName}》</span>
          </div>
        </div>
      </div>
      <button class="song-action-btn fav active" style="margin-left:auto;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </button>
    `;

    card.querySelector('.song-action-btn.fav').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(song.id);
    });

    // 传入收藏 Playlist 作为翻页上下文
    const contextPlaylist = sortedFavorites.map(favItem => state.flatSongs.find(s => s.id === favItem.id)).filter(Boolean);
    card.addEventListener('click', () => {
      openSongLyrics(song, '', contextPlaylist);
    });

    container.appendChild(card);
  });
}
function toggleFavorite(songId) {
  const index = state.favorites.findIndex(item => item.id === songId);
  if (index > -1) {
    state.favorites.splice(index, 1);
    showToast('已取消收藏');
  } else {
    state.favorites.push({ id: songId, time: Date.now() });
    showToast('已加入收藏');
  }
  saveFavorites();
  
  // 如果在收藏页，需要重新渲染
  if (state.activeTab === 'favorites') {
    renderFavorites();
  }
  
  // 更新歌曲详情页中的收藏按钮状态
  updateFavoriteButtonState();
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

// 歌词字号调整与应用
function applyLyricsFontSize() {
  const lines = document.querySelectorAll('.lyric-line');
  lines.forEach(line => {
    if (line.classList.contains('highlight-line')) {
      line.style.fontSize = (state.lyricsFontSize + 2) + 'px';
    } else {
      line.style.fontSize = state.lyricsFontSize + 'px';
    }
  });
}

function changeLyricsFontSize(delta) {
  state.lyricsFontSize = Math.min(26, Math.max(14, state.lyricsFontSize + delta));
  localStorage.setItem('jay_lyrics_font_size', state.lyricsFontSize);
  applyLyricsFontSize();
}

// 播放列表内切歌
function switchSongInPlaylist(direction) {
  if (!state.currentSong || !state.currentPlaylist || state.currentPlaylist.length === 0) return;
  
  const currentIndex = state.currentPlaylist.findIndex(song => song.id === state.currentSong.id);
  if (currentIndex === -1) return;
  
  let nextIndex = currentIndex + direction;
  
  // 循环切歌
  if (nextIndex < 0) {
    nextIndex = state.currentPlaylist.length - 1;
  } else if (nextIndex >= state.currentPlaylist.length) {
    nextIndex = 0;
  }
  
  const nextSong = state.currentPlaylist[nextIndex];
  openSongLyrics(nextSong, '', state.currentPlaylist);
}
