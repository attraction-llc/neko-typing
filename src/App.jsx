import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ===== STORAGE HELPERS =====
const NS = "nekoTyping_v1_";
const STORAGE_KEYS = ["level","xp","totalXp","collection","correct","miss"];
const saveToStorage = (key, value) => {
  try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch {}
};
const loadFromStorage = (key, defaultValue) => {
  try {
    const v = localStorage.getItem(NS + key);
    return v === null ? defaultValue : JSON.parse(v);
  } catch { return defaultValue; }
};

// ===== 100 CATS =====
const CATS = [
  // ★ ノーマル (25)
  { id:1, name:"しろねこ", r:"★", c:"#f5f5f5", d:"まっしろでふわふわ", ec:"#333", p:"solid" },
  { id:2, name:"くろねこ", r:"★", c:"#3a3a3a", d:"よるのおさんぽがすき", ec:"#ffd93d", p:"solid" },
  { id:3, name:"みけねこ", r:"★", c:"#e8a87c", d:"３つのいろがじまん", ec:"#333", p:"calico" },
  { id:4, name:"ちゃとらねこ", r:"★", c:"#d4893f", d:"あまえんぼう", ec:"#333", p:"tabby" },
  { id:5, name:"はちわれねこ", r:"★", c:"#666", d:"おでこのもようがチャームポイント", ec:"#5a5", p:"bicolor" },
  { id:6, name:"グレーねこ", r:"★", c:"#888", d:"おちついたせいかく", ec:"#4a4", p:"solid" },
  { id:7, name:"クリームねこ", r:"★", c:"#f0d5a8", d:"やさしいクリームいろ", ec:"#963", p:"solid" },
  { id:8, name:"あかちゃんねこ", r:"★", c:"#f5e0d0", d:"ちいさくてかわいい", ec:"#333", p:"solid", t:"small" },
  { id:9, name:"でぶねこ", r:"★", c:"#e8c078", d:"もちもちボディ", ec:"#333", p:"solid", t:"chubby" },
  { id:10, name:"しましまねこ", r:"★", c:"#b0956a", d:"きれいなしましま", ec:"#333", p:"stripes" },
  { id:11, name:"はなぶちねこ", r:"★", c:"#f8f0e0", d:"はなのうえにもよう", ec:"#553", p:"nosespot" },
  { id:12, name:"くつしたねこ", r:"★", c:"#c4a882", d:"あしさきだけしろい", ec:"#333", p:"socks" },
  { id:13, name:"おひげねこ", r:"★", c:"#e0d0b8", d:"りっぱなおひげ", ec:"#333", p:"solid", t:"whiskers" },
  { id:14, name:"ぶちねこ", r:"★", c:"#f0f0f0", d:"くろいぶちもよう", ec:"#333", p:"spots" },
  { id:15, name:"サビねこ", r:"★", c:"#8b5e3c", d:"ふしぎなサビもよう", ec:"#da5", p:"tortie" },
  { id:16, name:"うすちゃねこ", r:"★", c:"#c9a96e", d:"うすいちゃいろ", ec:"#333", p:"solid" },
  { id:17, name:"パンダねこ", r:"★", c:"#f5f5f5", d:"めのまわりがくろい", ec:"#333", p:"panda" },
  { id:18, name:"おでこブチねこ", r:"★", c:"#f0e0d0", d:"おでこにまるいブチ", ec:"#553", p:"fspot" },
  { id:19, name:"しっぽくるりんねこ", r:"★", c:"#dac090", d:"しっぽがくるんとまるい", ec:"#333", p:"solid" },
  { id:20, name:"ながねこ", r:"★", c:"#c8b898", d:"からだがながーい", ec:"#333", p:"solid", t:"long" },
  { id:21, name:"チョコねこ", r:"★", c:"#5c3d2e", d:"チョコレートいろ", ec:"#da5", p:"solid" },
  { id:22, name:"ミルクティーねこ", r:"★", c:"#c9a882", d:"ミルクティーのいろ", ec:"#553", p:"solid" },
  { id:23, name:"こむぎねこ", r:"★", c:"#e8c878", d:"こむぎいろのけなみ", ec:"#333", p:"solid" },
  { id:24, name:"はいいろぶちねこ", r:"★", c:"#bbb", d:"はいいろのぶちもよう", ec:"#333", p:"gspots" },
  { id:25, name:"もふもふねこ", r:"★", c:"#e8ddd0", d:"とにかくもふもふ", ec:"#333", p:"solid", t:"fluffy" },

  // ★★ アンコモン (25)
  { id:26, name:"サバトラねこ", r:"★★", c:"#7a8b6f", d:"しましまもようがかっこいい", ec:"#4a4", p:"tabby" },
  { id:27, name:"キジトラねこ", r:"★★", c:"#8b6914", d:"にほんいちにんきもの", ec:"#da5", p:"tabby" },
  { id:28, name:"ロシアンブルー", r:"★★", c:"#7b98b5", d:"きひんのあるグレーのけなみ", ec:"#6b6", p:"solid" },
  { id:29, name:"スコティッシュ", r:"★★", c:"#c4a882", d:"おれみみがかわいい", ec:"#da5", p:"solid", t:"fold" },
  { id:30, name:"マンチカン", r:"★★", c:"#d4a574", d:"みじかいあしでトコトコ", ec:"#333", p:"solid", t:"short" },
  { id:31, name:"ブリティッシュ", r:"★★", c:"#8090a0", d:"まんまるおかお", ec:"#da5", p:"solid", t:"round" },
  { id:32, name:"アメリカンカール", r:"★★", c:"#c09870", d:"みみがそとにカール", ec:"#333", p:"solid", t:"curl" },
  { id:33, name:"ソマリねこ", r:"★★", c:"#b5704a", d:"きつねみたいなねこ", ec:"#4a4", p:"ticked" },
  { id:34, name:"トンキニーズ", r:"★★", c:"#c4a088", d:"おしゃべりだいすき", ec:"#4a90d9", p:"pointed" },
  { id:35, name:"バーミーズ", r:"★★", c:"#6b4830", d:"ぬいぐるみみたい", ec:"#ffd93d", p:"solid" },
  { id:36, name:"ボンベイねこ", r:"★★", c:"#1a1a1a", d:"くろヒョウみたい", ec:"#ffd93d", p:"solid" },
  { id:37, name:"エキゾチック", r:"★★", c:"#e0c8a0", d:"ぺちゃんこおはな", ec:"#da5", p:"solid", t:"flat" },
  { id:38, name:"シンガプーラ", r:"★★", c:"#c4a070", d:"せかいいちちいさい", ec:"#6b6", p:"ticked", t:"small" },
  { id:39, name:"コラットねこ", r:"★★", c:"#6a7a8a", d:"しあわせをよぶねこ", ec:"#6b6", p:"solid" },
  { id:40, name:"セルカークレックス", r:"★★", c:"#b8a090", d:"カーリーヘアがじまん", ec:"#333", p:"solid", t:"curly" },
  { id:41, name:"デボンレックス", r:"★★", c:"#c0a898", d:"おおきなおみみ", ec:"#4a4", p:"solid", t:"bigear" },
  { id:42, name:"オシキャット", r:"★★", c:"#c4953a", d:"ヤマネコみたいなもよう", ec:"#da5", p:"leopard" },
  { id:43, name:"ターキッシュバン", r:"★★", c:"#f8f0e8", d:"およぐのがとくい", ec:"#da5", p:"van" },
  { id:44, name:"バリニーズ", r:"★★", c:"#f0e0d0", d:"エレガントなシャムのなかま", ec:"#4a90d9", p:"pointed" },
  { id:45, name:"ヒマラヤン", r:"★★", c:"#f0e6d8", d:"ペルシャとシャムのハーフ", ec:"#4a90d9", p:"pointed", t:"fluffy" },
  { id:46, name:"シャルトリュー", r:"★★", c:"#7080a0", d:"フランスのびじんねこ", ec:"#da5", p:"solid" },
  { id:47, name:"ラパーマ", r:"★★", c:"#b8a080", d:"パーマのけなみ", ec:"#4a4", p:"solid", t:"curly" },
  { id:48, name:"ハバナブラウン", r:"★★", c:"#6b3a20", d:"チョコレートブラウン", ec:"#6b6", p:"solid" },
  { id:49, name:"アメリカンワイヤー", r:"★★", c:"#c0a070", d:"ワイヤーみたいなけなみ", ec:"#da5", p:"solid" },
  { id:50, name:"ジャパニーズボブ", r:"★★", c:"#f5f0e0", d:"しっぽがポンポン", ec:"#333", p:"calico", t:"bob" },

  // ★★★ レア (20)
  { id:51, name:"ペルシャねこ", r:"★★★", c:"#e8dcc8", d:"ゴージャスなながいけなみ", ec:"#da5", p:"solid", t:"fluffy" },
  { id:52, name:"シャムねこ", r:"★★★", c:"#f0e6d2", d:"ブルーのおめめがきれい", ec:"#4a90d9", p:"pointed" },
  { id:53, name:"メインクーン", r:"★★★", c:"#8b6f47", d:"やさしいきょじん", ec:"#4a4", p:"tabby", t:"big" },
  { id:54, name:"ベンガルねこ", r:"★★★", c:"#c4953a", d:"ヒョウがらがワイルド", ec:"#4a4", p:"leopard" },
  { id:55, name:"アメショー", r:"★★★", c:"#a0a0a0", d:"しましまもようのにんきもの", ec:"#4a4", p:"tabby" },
  { id:56, name:"サイベリアン", r:"★★★", c:"#907050", d:"さむさにつよいもふねこ", ec:"#4a4", p:"tabby", t:"fluffy" },
  { id:57, name:"ブリティッシュロング", r:"★★★", c:"#8090a0", d:"ながいけのまるがお", ec:"#da5", p:"solid", t:"fluffy" },
  { id:58, name:"トイガー", r:"★★★", c:"#c48020", d:"トラそっくりのねこ", ec:"#333", p:"tiger" },
  { id:59, name:"サバンナキャット", r:"★★★", c:"#c4a050", d:"サバンナのおうじさま", ec:"#4a4", p:"leopard", t:"big" },
  { id:60, name:"ターキッシュアンゴラ", r:"★★★", c:"#f8f4f0", d:"しろくてエレガント", ec:"#4a90d9", p:"solid", t:"fluffy" },
  { id:61, name:"バーマン", r:"★★★", c:"#f0e0d0", d:"てぶくろをはいたねこ", ec:"#4a90d9", p:"pointed" },
  { id:62, name:"ソマリロング", r:"★★★", c:"#b5704a", d:"きつねのようなしっぽ", ec:"#4a4", p:"ticked", t:"fluffy" },
  { id:63, name:"ピクシーボブ", r:"★★★", c:"#907858", d:"ヤマネコみたいでワイルド", ec:"#da5", p:"tabby", t:"bob" },
  { id:64, name:"オリエンタル", r:"★★★", c:"#6a5a4a", d:"ほそながスタイリッシュ", ec:"#6b6", p:"solid", t:"big" },
  { id:65, name:"コーニッシュレックス", r:"★★★", c:"#c0b0a0", d:"ベルベットのけなみ", ec:"#4a4", p:"solid", t:"bigear" },
  { id:66, name:"にくきゅうまるねこ", r:"★★★", c:"#f0d8c0", d:"にくきゅうがぷにぷに", ec:"#333", p:"solid" },
  { id:67, name:"おめめまんまるねこ", r:"★★★", c:"#e8d8c0", d:"まんまるおめめ", ec:"#333", p:"solid", t:"bigeye" },
  { id:68, name:"おすましねこ", r:"★★★", c:"#d0c0b0", d:"いつもおすましがお", ec:"#333", p:"solid", t:"smug" },
  { id:69, name:"ねむりねこ", r:"★★★", c:"#e8d8c8", d:"いつもねむたい", ec:"#333", p:"solid", t:"sleepy" },
  { id:70, name:"おすわりねこ", r:"★★★", c:"#d8c8a8", d:"おぎょうぎがいい", ec:"#333", p:"solid" },

  // ★★★★ スーパーレア (15)
  { id:71, name:"ノルウェージャン", r:"★★★★", c:"#b8956a", d:"もりのようせいとよばれる", ec:"#4a4", p:"tabby", t:"fluffy" },
  { id:72, name:"ラグドール", r:"★★★★", c:"#e8ddd0", d:"だっこがだいすき", ec:"#4a90d9", p:"pointed", t:"fluffy" },
  { id:73, name:"アビシニアン", r:"★★★★", c:"#c4854a", d:"うんどうしんけいバツグン", ec:"#4a4", p:"ticked" },
  { id:74, name:"スフィンクス", r:"★★★★", c:"#d8b898", d:"けがないふしぎなねこ", ec:"#4a4", p:"hairless", t:"bigear" },
  { id:75, name:"さくらねこ", r:"★★★★", c:"#ffb7c5", d:"さくらいろのけなみ", ec:"#c44", p:"solid", s:"sakura" },
  { id:76, name:"そらいろねこ", r:"★★★★", c:"#87ceeb", d:"あおぞらのようないろ", ec:"#fff", p:"solid", s:"sky" },
  { id:77, name:"ゆきねこ", r:"★★★★", c:"#e0eef8", d:"ゆきのようにきらきら", ec:"#4a90d9", p:"solid", s:"snow" },
  { id:78, name:"ほのおねこ", r:"★★★★", c:"#e85030", d:"あついハートのもちぬし", ec:"#ffd93d", p:"solid", s:"fire" },
  { id:79, name:"みずいろねこ", r:"★★★★", c:"#50b8d8", d:"うみがだいすき", ec:"#fff", p:"solid", s:"water" },
  { id:80, name:"もりのねこ", r:"★★★★", c:"#5a8a4a", d:"もりにすむふしぎなねこ", ec:"#ffd93d", p:"solid", s:"forest" },
  { id:81, name:"サンセットねこ", r:"★★★★", c:"#e87040", d:"ゆうやけいろのけなみ", ec:"#ffd93d", p:"solid", s:"sunset" },
  { id:82, name:"オーロラねこ", r:"★★★★", c:"#70c8a8", d:"オーロラをまとう", ec:"#c77dff", p:"solid", s:"aurora" },
  { id:83, name:"きんいろねこ", r:"★★★★", c:"#d4a017", d:"きらめくきんいろのけなみ", ec:"#c44", p:"solid", s:"gold" },
  { id:84, name:"ぎんいろねこ", r:"★★★★", c:"#b0b8c0", d:"つきのひかりのようなぎん", ec:"#4a90d9", p:"solid", s:"silver" },
  { id:85, name:"スターねこ", r:"★★★★", c:"#f0e040", d:"ほしのかがやきをもつ", ec:"#c44", p:"solid", s:"star" },

  // ★★★★★ ウルトラレア (15)
  { id:86, name:"にじいろねこ", r:"★★★★★", c:"rainbow", d:"でんせつの7いろねこ", ec:"#ff6b6b", p:"solid", s:"rainbow" },
  { id:87, name:"うちゅうねこ", r:"★★★★★", c:"cosmic", d:"ほしぞらをまとうしんぴのねこ", ec:"#c77dff", p:"solid", s:"cosmic" },
  { id:88, name:"りゅうのねこ", r:"★★★★★", c:"#2d8040", d:"ドラゴンのちからをもつ", ec:"#ffd93d", p:"solid", s:"dragon" },
  { id:89, name:"てんしねこ", r:"★★★★★", c:"#f0f0ff", d:"はねをもつてんしのねこ", ec:"#87ceeb", p:"solid", s:"angel" },
  { id:90, name:"あくまねこ", r:"★★★★★", c:"#2a0a3a", d:"いたずらずきなあくまねこ", ec:"#ff3333", p:"solid", s:"demon" },
  { id:91, name:"クリスタルねこ", r:"★★★★★", c:"#c0ddf0", d:"からだがクリスタル", ec:"#88ccff", p:"solid", s:"crystal" },
  { id:92, name:"さくらんぼねこ", r:"★★★★★", c:"#e83050", d:"あたまにさくらんぼ", ec:"#333", p:"solid", s:"cherry" },
  { id:93, name:"おうさまねこ", r:"★★★★★", c:"#c8a020", d:"ねこのなかのおうさま", ec:"#c44", p:"solid", s:"king" },
  { id:94, name:"まほうつかいねこ", r:"★★★★★", c:"#5030a0", d:"まほうがつかえるねこ", ec:"#ffd93d", p:"solid", s:"wizard" },
  { id:95, name:"にんじゃねこ", r:"★★★★★", c:"#2a2a3a", d:"かげにかくれるにんじゃ", ec:"#ff3333", p:"solid", s:"ninja" },
  { id:96, name:"うみのねこ", r:"★★★★★", c:"#1a6090", d:"しんかいからきたねこ", ec:"#40e0d0", p:"solid", s:"ocean" },
  { id:97, name:"たいようねこ", r:"★★★★★", c:"#e8a010", d:"たいようのちからをもつ", ec:"#ff3333", p:"solid", s:"sun" },
  { id:98, name:"つきのねこ", r:"★★★★★", c:"#e0dcd0", d:"まんげつのよにあらわれる", ec:"#4a90d9", p:"solid", s:"moon" },
  { id:99, name:"でんせつのけんしねこ", r:"★★★★★", c:"#4060c0", d:"つるぎをもつでんせつのねこ", ec:"#ffd93d", p:"solid", s:"knight" },
  { id:100, name:"ねこがみさま", r:"★★★★★", c:"#f0e8d0", d:"すべてのねこのかみさま", ec:"#ffd93d", p:"solid", s:"god" },
].map(c => ({ ...c, img: `${import.meta.env.BASE_URL}cats/${c.id.toString().padStart(3, "0")}.png` }));

const WORDS = {
  1: { label:"かんたん（1もじ）", words:"asdfjklghtyrueiwoqpbnmcxzv".split("").map(c=>({roma:c,hira:""})) },
  2: { label:"ふつう（2〜3もじ）", words:[
    ["ai","あい"],["ue","うえ"],["ao","あお"],
    ["ka","か"],["ki","き"],["ku","く"],["ke","け"],["ko","こ"],
    ["sa","さ"],["si","し"],["su","す"],["se","せ"],["so","そ"],
    ["ta","た"],["ti","ち"],["tu","つ"],["te","て"],["to","と"],
    ["na","な"],["ni","に"],["nu","ぬ"],["ne","ね"],["no","の"],
    ["ha","は"],["hi","ひ"],["hu","ふ"],["he","へ"],["ho","ほ"],
    ["ma","ま"],["mi","み"],["mu","む"],["me","め"],["mo","も"],
    ["ya","や"],["yu","ゆ"],["yo","よ"],
    ["ra","ら"],["ri","り"],["ru","る"],["re","れ"],["ro","ろ"],
    ["wa","わ"],["wo","を"],["nn","ん"]
  ].map(([roma,hira])=>({roma,hira})) },
  3: { label:"ちょいむず（たんご）", words:[
    ["neko","ねこ"],["inu","いぬ"],["sora","そら"],["umi","うみ"],["yama","やま"],
    ["kawa","かわ"],["hana","はな"],["mori","もり"],["kaze","かぜ"],["ame","あめ"],
    ["yuki","ゆき"],["hosi","ほし"],["tuki","つき"],["kumo","くも"],["niwa","にわ"],
    ["mado","まど"],["isu","いす"],["mizu","みず"],["ie","いえ"],["eki","えき"],
    ["mura","むら"],["mati","まち"],["kuni","くに"],["sato","さと"],["tori","とり"]
  ].map(([roma,hira])=>({roma,hira})) },
  4: { label:"むずかしい（ながいたんご）", words:[
    ["sakura","さくら"],["kodomo","こども"],["tomodati","ともだち"],["gakkou","がっこう"],["sensee","せんせい"],
    ["ohayou","おはよう"],["arigato","ありがと"],["konnitiwa","こんにちは"],["nekosuki","ねこすき"],["sugoiyo","すごいよ"],
    ["tanosii","たのしい"],["uresii","うれしい"],["ganbaru","がんばる"],["okaasan","おかあさん"],["otoosan","おとうさん"],
    ["oneesan","おねえさん"],["oniisan","おにいさん"],["purezento","プレゼント"],["keeki","ケーキ"],["oyasumi","おやすみ"]
  ].map(([roma,hira])=>({roma,hira})) },
};
const KB = [["q","w","e","r","t","y","u","i","o","p"],["a","s","d","f","g","h","j","k","l"],["z","x","c","v","b","n","m"]];
const GACHA_COST = 50;
const HOUSES = [
  { name:"ダンボールハウス", need:0, bg:"#d2b48c", fl:"#c4a06a", items:[] },
  { name:"ちいさなおへや", need:5, bg:"#f5e6d0", fl:"#deb887", items:["rug"] },
  { name:"ねこカフェ", need:15, bg:"#fff0e0", fl:"#e8c8a0", items:["rug","shelf","plant"] },
  { name:"ねこごてん", need:30, bg:"#fdf0e8", fl:"#d4a87a", items:["rug","shelf","plant","tower","sofa"] },
  { name:"ねこじょう", need:50, bg:"#f8f0ff", fl:"#c8a8d8", items:["rug","shelf","plant","tower","sofa","chandelier","fountain"] },
];
function getHouse(n){ let h=HOUSES[0]; for(const x of HOUSES){if(n>=x.need)h=x;} return h; }

// ===== THEME =====
const T = {
  bg:"#FFF8F0", card:"#FFFFFF",
  primary:"#FF8C42", primaryDark:"#D6691F",
  secondary:"#4ECDC4", secondaryDark:"#2EA39A",
  success:"#7BC67E", successDark:"#56A55A",
  error:"#FF6B6B", errorDark:"#D84343",
  xp:"#FFD93D", xpDark:"#C9A711",
  combo:"#FF69B4", comboDark:"#C73F8A",
  textMain:"#2D3436", textSub:"#636E72", textWhite:"#FFFFFF",
  keyBg:"#E8E8E8", keyText:"#666666",
};
const RARITY = {
  "★":     { color:"#B0B0B0", dark:"#7A7A7A", soft:"#ECECEC", label:"ノーマル",      glow:false,  samples:[] },
  "★★":    { color:"#7BC67E", dark:"#56A55A", soft:"#E7F5E7", label:"アンコモン",    glow:false,  samples:[] },
  "★★★":   { color:"#5B9BD5", dark:"#3A7AB0", soft:"#E3EEF9", label:"レア",          glow:false,  samples:[] },
  "★★★★":  { color:"#B07DD0", dark:"#7D4EA0", soft:"#F0E6F6", label:"スーパーレア",  glow:true,   samples:["✨","★"] },
  "★★★★★": { color:"#FFB800", dark:"#C88C00", soft:"#FFF4CC", label:"ウルトラレア",  glow:true,   samples:["🌟","✨","⭐"] },
};
const RARITY_ORDER = ["★","★★","★★★","★★★★","★★★★★"];
const LEVEL_SAMPLES = { 1:"a", 2:"ka", 3:"neko", 4:"arigato" };

// ===== CAT FACE (image-based) =====
function CatFace({ cat, size=64 }) {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [cat.img]);
  if (err) {
    return (
      <div style={{ width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:size*0.7, lineHeight:1, filter:"drop-shadow(0 2px 3px rgba(0,0,0,0.12))" }}>🐱</div>
    );
  }
  return (
    <img
      src={cat.img}
      alt={cat.name}
      width={size}
      height={size}
      onError={() => setErr(true)}
      style={{ objectFit:"contain", filter:"drop-shadow(0 2px 3px rgba(0,0,0,0.12))" }}
    />
  );
}

// ===== HOUSE CONSTANTS =====
const ACTIONS = ["idle","sleep","play","walk","groom","chase","sit","stretch"];
const EMOTIONS = ["💕","😴","✨","🐟","❓","🎵"];
const MEOWS = ["にゃー！","にゃ〜ん","みゃお","ごろごろ","ぷるる"];
const FLOOR_TOP = 138, FLOOR_BOT = 188, X_MIN = 18, X_MAX = 282;
const pickAction = () => ACTIONS[Math.floor(Math.random()*ACTIONS.length)];
const pickEmotion = () => EMOTIONS[Math.floor(Math.random()*EMOTIONS.length)];
const pickMeow = () => MEOWS[Math.floor(Math.random()*MEOWS.length)];
const getTimeMode = (d=new Date()) => { const h=d.getHours(); return h>=6&&h<17?"day":h<19?"sunset":"night"; };

// ===== MINI CAT =====
function MiniCat({ state, tick, onClick }) {
  const { cat, x, y, action, facing, emotion, speech, hearts, jumpUntil } = state;
  const sleeping=action==="sleep", playing=action==="play", walking=action==="walk",
        chasing=action==="chase", grooming=action==="groom",
        sitting=action==="sit", stretching=action==="stretch";
  const jumping = tick < jumpUntil;
  const jumpProgress = jumping ? (5-(jumpUntil-tick))/5 : 0;
  const bounce = playing ? -Math.abs(Math.sin(tick*0.28))*5
                : jumping ? -Math.sin(jumpProgress*Math.PI)*12 : 0;
  const sway = action==="idle" ? Math.sin(tick*0.05+cat.id)*2
             : grooming ? Math.sin(tick*0.5+cat.id)*1.5 : 0;
  const walkBob = (walking||chasing) ? Math.sin(tick*0.35+cat.id)*0.8 : 0;
  const rot = sleeping ? 15
            : grooming ? Math.sin(tick*0.3)*8
            : chasing ? facing*5
            : 0;
  const sy = stretching ? 1+Math.sin(tick*0.18)*0.22 : 1;
  const sx = facing * (stretching ? 0.92 : 1);
  const cx = x + sway, cy = y + bounce + walkBob;
  const speechAge = speech ? tick - speech.spawnedAt : 0;
  const speechFade = speech ? (speechAge<2 ? speechAge/2 : speechAge>10 ? Math.max(0,(12-speechAge)/2) : 1) : 0;
  const emoAge = emotion ? tick - emotion.spawnedAt : 0;
  const emoFade = emotion ? (emoAge<3 ? emoAge/3 : emoAge>12 ? Math.max(0,(15-emoAge)/3) : 1) : 0;
  const rare = RARITY[cat.r];

  return (
    <g transform={`translate(${cx},${cy})`} style={{cursor:"pointer"}}
       onPointerDown={e => { e.stopPropagation(); onClick(); }}>
      <title>{cat.name}（{cat.r} {rare.label}）</title>
      <image href={cat.img} width="30" height="30" x="-15" y="-15"
        transform={`scale(${sx},${sy}) rotate(${rot})`}
        style={{pointerEvents:"auto"}}/>
      {sleeping && <text x="6" y="-12" fontSize="6" fill="#88a"
        opacity={0.5+Math.sin(tick*0.1)*0.5} fontWeight="bold">z</text>}
      {playing && tick%20<10 && <text x="-2" y="-18" fontSize="5" fill={T.xp}>✦</text>}
      {sitting && tick%30<18 && <text x="-4" y="-16" fontSize="6" fill={T.primary}>♪</text>}
      {stretching && tick%24<12 && <text x="-3" y="-18" fontSize="5" fill={T.success} opacity="0.7">↕</text>}
      {grooming && tick%22<11 && <text x="-3" y="-16" fontSize="5" fill={T.secondary} opacity="0.7">〜</text>}
      {chasing && tick%8<4 && <text x={-facing*10} y="-2" fontSize="5" fill={T.primary} opacity="0.6">💨</text>}

      {emotion && <text x="-5" y={-20 - Math.min(emoAge,10)*0.8} fontSize="10" opacity={emoFade}>{emotion.icon}</text>}

      {speech && (() => {
        const w = Math.max(speech.text.length*5, cat.name.length*4.5+12) + 6;
        return (
          <g opacity={speechFade}>
            <rect x={-w/2} y="-40" width={w} height="18" fill="#fff" stroke={T.primary} strokeWidth="0.8" rx="5"/>
            <polygon points={`${-3},-22 0,-19 3,-22`} fill="#fff" stroke={T.primary} strokeWidth="0.8"/>
            <text x="0" y="-32" fontSize="6" fill={T.primary} textAnchor="middle" fontWeight="bold">{speech.text}</text>
            <text x="0" y="-25" fontSize="4" fill={T.textSub} textAnchor="middle">{cat.name} {cat.r}</text>
          </g>
        );
      })()}

      {hearts.map(h => {
        const age = tick - h.spawnedAt;
        const life = h.until - h.spawnedAt;
        const p = age / life;
        return <text key={h.id} x={h.dx} y={h.dy - age*1.6} fontSize="8" opacity={Math.max(0,1-p)}>💕</text>;
      })}
    </g>
  );
}

// ===== HOUSE VIEW =====
function HouseView({ collection, onBack }) {
  const [, forceRender] = useState(0);
  const tickRef = useRef(0);
  const catsRef = useRef([]);
  const [timeMode, setTimeMode] = useState(getTimeMode());
  const house = getHouse(collection.length);
  const nextH = HOUSES.find(h => h.need > collection.length);

  useEffect(() => {
    catsRef.current = collection.map(cat => {
      const s = cat.id*7+13;
      return {
        cat,
        x: X_MIN + 10 + (s*37 % (X_MAX-X_MIN-20)),
        y: FLOOR_TOP + (s*53 % (FLOOR_BOT-FLOOR_TOP)),
        vx: 0, vy: 0,
        facing: s%2===0 ? 1 : -1,
        action: "idle",
        nextChangeAt: Math.floor(Math.random()*80),
        emotion: null,
        speech: null,
        hearts: [],
        jumpUntil: 0,
        clickCount: 0,
        lastClickAt: -9999,
      };
    });
  }, [collection]);

  useEffect(() => {
    const iv = setInterval(() => {
      const t = ++tickRef.current;
      for (const c of catsRef.current) {
        if (t >= c.nextChangeAt) {
          c.action = pickAction();
          c.nextChangeAt = t + 50 + Math.floor(Math.random()*100);
          if (c.action === "walk") {
            c.vx = (Math.random()<0.5?-1:1) * 0.8;
            c.vy = 0;
            c.facing = c.vx > 0 ? 1 : -1;
          } else if (c.action === "chase") {
            const ang = Math.random()*Math.PI*2;
            c.vx = Math.cos(ang)*2.4;
            c.vy = Math.sin(ang)*1.1;
            c.facing = c.vx >= 0 ? 1 : -1;
          } else {
            c.vx = 0; c.vy = 0;
          }
        }
        if (c.action === "walk" || c.action === "chase") {
          c.x += c.vx; c.y += c.vy;
          if (c.x < X_MIN) { c.x = X_MIN; c.vx = -c.vx; c.facing = c.vx>=0?1:-1; }
          if (c.x > X_MAX) { c.x = X_MAX; c.vx = -c.vx; c.facing = c.vx>=0?1:-1; }
          if (c.y < FLOOR_TOP) { c.y = FLOOR_TOP; c.vy = -c.vy; }
          if (c.y > FLOOR_BOT) { c.y = FLOOR_BOT; c.vy = -c.vy; }
        }
        if (!c.emotion && Math.random() < 0.004) {
          c.emotion = { icon: pickEmotion(), spawnedAt: t };
        }
        if (c.emotion && t - c.emotion.spawnedAt > 15) c.emotion = null;
        if (c.speech && t - c.speech.spawnedAt > 12) c.speech = null;
        if (c.hearts.length) c.hearts = c.hearts.filter(h => t < h.until);
        if (c.clickCount > 0 && t - c.lastClickAt > 25) c.clickCount = 0;
      }
      forceRender(t);
    }, 100);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setTimeMode(getTimeMode()), 60000);
    return () => clearInterval(iv);
  }, []);

  const handleCatClick = (c) => {
    const t = tickRef.current;
    c.clickCount += 1;
    c.lastClickAt = t;
    c.jumpUntil = t + 5;
    c.speech = { text: pickMeow(), spawnedAt: t };
    if (c.clickCount >= 3) {
      for (let i = 0; i < 5; i++) {
        c.hearts.push({
          id: `${t}_${i}_${Math.random()}`,
          dx: (Math.random()-0.5)*28,
          dy: -18,
          spawnedAt: t,
          until: t + 16,
        });
      }
    }
    forceRender(n => n + 1);
  };

  return(
    <div style={{ minHeight:"100vh",
      background:`linear-gradient(180deg,${timeMode==="day"?"#87ceeb":timeMode==="sunset"?"#ffa07a":"#1a1a3a"} 0%,${timeMode==="day"?"#b0d8f0":timeMode==="sunset"?"#ffc89a":"#2a2a5a"} 40%,${house.bg} 40%)`,
      fontFamily:"'Zen Maru Gothic',sans-serif", animation:"fadeIn 0.3s ease", transition:"background 2s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", gap:10 }}>
        <button className="nt-btn nt-btn-sub" onClick={onBack}>← もどる</button>
        <div style={{ fontSize:20, fontWeight:900, color:timeMode==="night"?"#fff":T.textMain }}>🏠 {house.name}</div>
        <div style={{ fontSize:14, fontWeight:700, color:timeMode==="night"?"#dfe6e9":T.textSub, background:"rgba(255,255,255,0.85)", padding:"6px 12px", borderRadius:12, minWidth:64, textAlign:"center" }}>{collection.length}ひき</div>
      </div>
      {nextH&&<div style={{ textAlign:"center", marginBottom:10 }}>
        <div style={{ display:"inline-block", fontSize:13, fontWeight:700, color:T.textSub,
          background:"#FFFFFF", padding:"6px 14px", borderRadius:16,
          boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
          あと{nextH.need-collection.length}ひきで「{nextH.name}」にグレードアップ！
        </div>
      </div>}
      <div style={{ width:"100%", maxWidth:480, margin:"0 auto", padding:"0 10px" }}>
        <svg viewBox="0 0 300 200" style={{ width:"100%", borderRadius:16, background:house.bg,
          boxShadow:"0 6px 24px rgba(0,0,0,0.18)", touchAction:"manipulation" }}>
          <defs>
            <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#87ceeb"/><stop offset="100%" stopColor="#c8e8f8"/>
            </linearGradient>
            <linearGradient id="skySunset" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7b5a"/><stop offset="50%" stopColor="#ffa070"/><stop offset="100%" stopColor="#ffd080"/>
            </linearGradient>
            <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0a2a"/><stop offset="100%" stopColor="#2a2a5a"/>
            </linearGradient>
          </defs>
          <rect x="0" y="130" width="300" height="70" fill={house.fl}/>
          <line x1="0" y1="130" x2="300" y2="130" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
          {house.items.includes("rug")&&<ellipse cx="150" cy="165" rx="60" ry="15" fill="rgba(180,60,60,0.3)"/>}
          {house.items.includes("shelf")&&<><rect x="10" y="40" width="40" height="6" fill="#a0784a" rx="2"/><rect x="10" y="60" width="40" height="6" fill="#a0784a" rx="2"/><rect x="8" y="36" width="3" height="34" fill="#8a6840"/><rect x="49" y="36" width="3" height="34" fill="#8a6840"/></>}
          {house.items.includes("plant")&&<><rect x="260" y="105" width="16" height="25" fill="#b07040" rx="2"/><circle cx="268" cy="98" r="12" fill="#5a9a4a"/><circle cx="262" cy="92" r="8" fill="#6aaa5a"/></>}
          {house.items.includes("tower")&&<><rect x="240" y="50" width="20" height="80" fill="#c4a06a" rx="3"/><rect x="235" y="50" width="30" height="8" fill="#d4b07a" rx="4"/><rect x="235" y="80" width="30" height="8" fill="#d4b07a" rx="4"/><rect x="235" y="110" width="30" height="8" fill="#d4b07a" rx="4"/></>}
          {house.items.includes("sofa")&&<><rect x="60" y="100" width="50" height="20" fill="#c06060" rx="5"/><rect x="55" y="95" width="10" height="30" fill="#b05050" rx="4"/><rect x="105" y="95" width="10" height="30" fill="#b05050" rx="4"/><rect x="60" y="90" width="50" height="12" fill="#d07070" rx="5"/></>}
          {house.items.includes("chandelier")&&<><line x1="150" y1="0" x2="150" y2="20" stroke="#c8a020" strokeWidth="1"/><ellipse cx="150" cy="25" rx="20" ry="8" fill="none" stroke="#d4b030" strokeWidth="1.5"/><circle cx="135" cy="28" r="2" fill="#ffd93d" opacity="0.8"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/></circle><circle cx="150" cy="30" r="2" fill="#ffd93d" opacity="0.8"><animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite"/></circle><circle cx="165" cy="28" r="2" fill="#ffd93d" opacity="0.8"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite"/></circle></>}
          {house.items.includes("fountain")&&<><ellipse cx="150" cy="170" rx="25" ry="8" fill="#80c0e0" opacity="0.5"/><rect x="146" y="150" width="8" height="20" fill="#a0a0a0" rx="2"/><circle cx="150" cy="148" r="5" fill="#90b8d8" opacity="0.6"><animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/></circle></>}
          <rect x="125" y="20" width="50" height="40"
            fill={timeMode==="day"?"url(#skyDay)":timeMode==="sunset"?"url(#skySunset)":"url(#skyNight)"}
            stroke="#a0784a" strokeWidth="3" rx="2"/>
          {timeMode==="day" && <>
            <circle cx="160" cy="32" r="4" fill="#ffd93d"/>
            <circle cx="160" cy="32" r="6" fill="#ffd93d" opacity="0.3"/>
            <ellipse cx="138" cy="36" rx="6" ry="2" fill="#fff" opacity="0.8"/>
            <ellipse cx="165" cy="48" rx="5" ry="1.8" fill="#fff" opacity="0.7"/>
          </>}
          {timeMode==="sunset" && <>
            <circle cx="150" cy="52" r="6" fill="#ffe0a0" opacity="0.95"/>
            <ellipse cx="150" cy="56" rx="20" ry="3" fill="#ffb070" opacity="0.4"/>
            <ellipse cx="135" cy="40" rx="7" ry="2" fill="#ffcc99" opacity="0.7"/>
          </>}
          {timeMode==="night" && <>
            <circle cx="162" cy="30" r="4" fill="#fffacd"/>
            <circle cx="160" cy="29" r="3" fill="#2a2a5a"/>
            <circle cx="132" cy="28" r="0.6" fill="#fff"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.1s" repeatCount="indefinite"/></circle>
            <circle cx="142" cy="38" r="0.5" fill="#fff"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.7s" repeatCount="indefinite"/></circle>
            <circle cx="138" cy="50" r="0.6" fill="#fff"><animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.5s" repeatCount="indefinite"/></circle>
            <circle cx="170" cy="50" r="0.5" fill="#fff"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.9s" repeatCount="indefinite"/></circle>
            <circle cx="148" cy="26" r="0.4" fill="#fff"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.3s" repeatCount="indefinite"/></circle>
          </>}
          <line x1="150" y1="20" x2="150" y2="60" stroke="#a0784a" strokeWidth="2"/>
          <line x1="125" y1="40" x2="175" y2="40" stroke="#a0784a" strokeWidth="2"/>
          {catsRef.current.map(state => (
            <MiniCat key={state.cat.id} state={state} tick={tickRef.current}
              onClick={() => handleCatClick(state)}/>
          ))}
          {collection.length===0&&<text x="150" y="110" textAnchor="middle" fontSize="12" fill="#999" fontWeight="700">まだねこがいないよ… ガチャでむかえよう！</text>}
        </svg>
      </div>
      <div style={{ maxWidth:480, margin:"14px auto 0", padding:"0 12px" }}>
        <div style={{ fontSize:13, color:T.textSub, textAlign:"center", marginBottom:8, fontWeight:700 }}>
          💡 ねこをタップするとリアクション！3かいタップでハート💕
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center",
          background:T.card, borderRadius:16, padding:14, boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
          {collection.length>0?collection.map(cat=>{
            const rare = RARITY[cat.r];
            return(
              <div key={cat.id} style={{ background:rare.soft, borderRadius:12, padding:"6px 10px",
                textAlign:"center", fontSize:12, fontWeight:800, color:T.textMain, minWidth:60,
                border:`2px solid ${rare.color}` }}>
                <div style={{ fontSize:12, color:T.textMain }}>{cat.name}</div>
                <div style={{ fontSize:12, color:rare.dark, fontWeight:900 }}>{cat.r}</div>
              </div>
            );
          }):<div style={{ fontSize:14, color:T.textSub, padding:20, fontWeight:700 }}>タイピングでXPをためてガチャをまわそう！</div>}
        </div>
      </div>
      <div style={{ height:24 }}/>
    </div>
  );
}

// ===== GACHA MODAL =====
function GachaModal({ cat, isNew, onClose }) {
  const [phase, setPhase] = useState(0);
  const rarity = RARITY[cat.r];
  const isUltra = cat.r === "★★★★★";
  const isSuper = cat.r === "★★★★";
  const revealDelay = isUltra ? 3500 : isSuper ? 2500 : 1500;

  useEffect(()=>{const t=setTimeout(()=>setPhase(1),revealDelay);return()=>clearTimeout(t);},[revealDelay]);

  const starCount = isUltra ? 18 : isSuper ? 10 : 0;
  const stars = useMemo(() => Array.from({length:starCount}, (_,i) => ({
    id:i, x: 50+Math.cos(i/starCount*Math.PI*2)*40,
    y: 50+Math.sin(i/starCount*Math.PI*2)*40,
    delay: i*0.08,
    emoji: isUltra ? ["⭐","✨","🌟","💫"][i%4] : ["✨","★"][i%2]
  })), [starCount, isUltra]);

  const confetti = useMemo(() => isUltra ? Array.from({length:24}, (_,i) => ({
    id:i, left: Math.random()*100, delay: Math.random()*0.8,
    color: ["#FF6B6B","#FFD93D","#7BC67E","#4ECDC4","#B07DD0","#FF8C42"][i%6],
    rot: Math.random()*360,
  })) : [], [isUltra]);

  const bgStyle = phase===0
    ? (isUltra ? "conic-gradient(from 0deg,#FF6B6B,#FFD93D,#7BC67E,#4ECDC4,#B07DD0,#FF8C42,#FF6B6B)"
      : isSuper ? "radial-gradient(circle,#FFD700,#B07DD0)"
      : cat.r==="★★★" ? "radial-gradient(circle,#FFD93D,#5B9BD5)"
      : cat.r==="★★" ? "radial-gradient(circle,#FFD93D,#7BC67E)"
      : "radial-gradient(circle,#FFD93D,#FF8C42)")
    : (isUltra ? "linear-gradient(135deg,#FFF4D6,#FFE099,#FFD93D,#FFB800)"
      : isSuper ? "linear-gradient(135deg,#F5E6F9,#E7D0F0)"
      : cat.r==="★★★" ? "linear-gradient(135deg,#E3EEF9,#C7DEF3)"
      : cat.r==="★★" ? "linear-gradient(135deg,#E7F5E7,#C6E6C6)"
      : "#FFFFFF");

  return(
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000,
      animation:"fadeIn 0.3s", padding:16, overflow:"hidden" }}>

      {/* 紙吹雪 (ウルトラレアのみ) */}
      {phase===1 && isUltra && confetti.map(c => (
        <div key={c.id} style={{
          position:"absolute", top:-20, left:`${c.left}%`, width:10, height:14,
          background:c.color, borderRadius:2, pointerEvents:"none",
          animation:`confetti 3s ${c.delay}s linear infinite`,
          transform:`rotate(${c.rot}deg)`
        }}/>
      ))}

      {/* 光の放射 (レア以上) */}
      {phase===1 && !isUltra && cat.r.length>=3 && (
        <div style={{position:"absolute", inset:0, pointerEvents:"none",
          background:`radial-gradient(circle at center, ${rarity.color}33 0%, transparent 60%)`,
          animation:"fadeIn 0.6s"}}/>
      )}

      <div style={{
        position:"relative",
        background:bgStyle,
        borderRadius:24, padding:isUltra?"44px 48px":"36px 44px", textAlign:"center", minWidth:280, maxWidth:360,
        boxShadow: isUltra ? `0 0 60px ${rarity.color}, 0 20px 60px rgba(0,0,0,0.4)`
                 : isSuper ? `0 0 40px ${rarity.color}aa, 0 18px 50px rgba(0,0,0,0.35)`
                 : "0 16px 50px rgba(0,0,0,0.35)",
        animation: phase===0
          ? (isUltra ? "gachaUltraShake 0.18s infinite alternate" : "gachaShake 0.15s infinite alternate")
          : (isUltra ? "gachaPopUltra 0.7s cubic-bezier(0.175,0.885,0.32,1.275)"
            : isSuper ? "gachaPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275)"
            : "gachaPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)"),
      }}>
        {/* オーラ演出 (スーパーレア/ウルトラレア) */}
        {phase===1 && (isSuper||isUltra) && (
          <div style={{position:"absolute", inset:-20, borderRadius:32, pointerEvents:"none",
            background:`radial-gradient(circle, ${rarity.color}55 0%, transparent 70%)`,
            animation:"auraGlow 2s ease-in-out infinite"}}/>
        )}

        {/* まわりに飛び散る星 (スーパーレア以上) */}
        {phase===1 && stars.map(s => (
          <div key={s.id} style={{
            position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
            fontSize: isUltra?20:16,
            animation:`starBurst 1.4s ${s.delay}s ease-out both`,
            pointerEvents:"none", zIndex:1
          }}>{s.emoji}</div>
        ))}

        {phase===0 ? (
          <div style={{fontSize:80, animation:"pulse 0.5s infinite"}}>🎁</div>
        ) : (
          <div style={{position:"relative", zIndex:2}}>
            {/* 特別ラベル */}
            <div style={{
              fontSize: isUltra ? 20 : 14,
              color: isUltra ? "#fff" : rarity.dark,
              fontWeight:900, letterSpacing:2, marginBottom:8,
              textShadow: isUltra ? "0 2px 6px rgba(201,167,17,0.6), 0 0 10px #fff" : "none"
            }}>
              {isUltra ? "🌟 でんせつのねこ！🌟"
               : isSuper ? "✨ ちょうレア！ ✨"
               : cat.r==="★★★" ? "💎 レア！ 💎"
               : isNew ? "🆕 あたらしいねこ！" : "もっているねこ"}
            </div>

            {/* 猫画像 */}
            <div style={{
              display:"inline-block",
              padding:isUltra?8:4,
              borderRadius:20,
              background: isUltra ? "rgba(255,255,255,0.7)" : isSuper ? "rgba(255,255,255,0.5)" : "transparent",
              boxShadow: isUltra ? `inset 0 0 30px ${rarity.color}66` : "none"
            }}>
              <CatFace cat={cat} size={isUltra?120:100}/>
            </div>

            <div style={{fontSize:24, fontWeight:900, marginTop:12, color:T.textMain}}>{cat.name}</div>
            <div style={{
              display:"inline-block", marginTop:6, padding:"4px 14px",
              borderRadius:16, background:rarity.color, color:"#fff",
              fontSize:16, fontWeight:900, letterSpacing:1,
              boxShadow:`0 3px 0 ${rarity.dark}`
            }}>{cat.r} {rarity.label}</div>
            <div style={{fontSize:14, color:T.textSub, marginTop:10, fontWeight:700}}>「{cat.d}」</div>

            <button onClick={onClose} className="nt-btn nt-btn-primary" style={{marginTop:20}}>
              {isNew ? "やったー！" : "OK！"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MAIN =====
export default function NekoTyping() {
  const [screen,setScreen]=useState("title");
  const [level,setLevel]=useState(()=>loadFromStorage("level",1));
  const [xp,setXp]=useState(()=>loadFromStorage("xp",0));
  const [totalXp,setTotalXp]=useState(()=>loadFromStorage("totalXp",0));
  const [collection,setCollection]=useState(()=>loadFromStorage("collection",[]));
  const [word,setWord]=useState(null);
  const [typed,setTyped]=useState("");
  const [combo,setCombo]=useState(0);
  const [correct,setCorrect]=useState(()=>loadFromStorage("correct",0));
  const [miss,setMiss]=useState(()=>loadFromStorage("miss",0));
  const [shakeKey,setShakeKey]=useState(null);
  const [flashKey,setFlashKey]=useState(null);
  const [flashId,setFlashId]=useState(0);
  const [flashData,setFlashData]=useState({xp:0,combo:0});
  const [gachaCat,setGachaCat]=useState(null);
  const [gachaNew,setGachaNew]=useState(false);

  useEffect(()=>saveToStorage("level",level),[level]);
  useEffect(()=>saveToStorage("xp",xp),[xp]);
  useEffect(()=>saveToStorage("totalXp",totalXp),[totalXp]);
  useEffect(()=>saveToStorage("collection",collection),[collection]);
  useEffect(()=>saveToStorage("correct",correct),[correct]);
  useEffect(()=>saveToStorage("miss",miss),[miss]);

  const resetData=()=>{
    if(!confirm("ほんとうにリセットしますか？\nあつめたねこがぜんぶきえてしまいます！"))return;
    try{STORAGE_KEYS.forEach(k=>localStorage.removeItem(NS+k));}catch{}
    setLevel(1);setXp(0);setTotalXp(0);setCollection([]);setCorrect(0);setMiss(0);setCombo(0);
  };

  const nextWord=useCallback(()=>{const w=WORDS[level].words;return w[Math.floor(Math.random()*w.length)];},[level]);
  useEffect(()=>{if(screen==="game"&&!word){setWord(nextWord());setTyped("");}},[screen,word,nextWord]);

  const onKey=useCallback((e)=>{
    if(gachaCat)return;
    if(screen==="game"&&e.key==="Escape"){e.preventDefault();setScreen("title");return;}
    if(screen!=="game")return;
    if(e.key===" "){e.preventDefault();setCombo(0);setWord(nextWord());setTyped("");return;}
    const k=e.key.toLowerCase();
    if(k.length!==1||e.ctrlKey||e.metaKey||e.altKey)return;
    e.preventDefault();
    if(!word)return;
    const nx=word.roma[typed.length];
    if(k===nx){
      const nw=typed+k;setTyped(nw);setCorrect(c=>c+1);
      setCombo(c=>c+1);
      setFlashKey(k);setTimeout(()=>setFlashKey(f=>f===k?null:f),180);
      if(nw===word.roma){
        const bx=level*5+(combo>=5?5:0);
        setXp(x=>x+bx);setTotalXp(t=>t+bx);
        setFlashData({xp:bx,combo:combo+1});setFlashId(f=>f+1);
        setTimeout(()=>{setWord(nextWord());setTyped("")},400);
      }
    }else{setMiss(m=>m+1);setCombo(0);setShakeKey(nx);setTimeout(()=>setShakeKey(null),300);}
  },[screen,gachaCat,word,typed,combo,level,nextWord]);

  useEffect(()=>{window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[onKey]);

  const doGacha=()=>{
    if(xp<GACHA_COST)return;setXp(x=>x-GACHA_COST);
    const r=Math.random();let pool;
    if(r<0.02)pool=CATS.filter(c=>c.r==="★★★★★");
    else if(r<0.08)pool=CATS.filter(c=>c.r==="★★★★");
    else if(r<0.22)pool=CATS.filter(c=>c.r==="★★★");
    else if(r<0.50)pool=CATS.filter(c=>c.r==="★★");
    else pool=CATS.filter(c=>c.r==="★");
    const cat=pool[Math.floor(Math.random()*pool.length)];
    const isNew=!collection.find(c=>c.id===cat.id);
    setGachaCat(cat);setGachaNew(isNew);
    if(isNew)setCollection(p=>[...p,cat]);
  };

  const house=getHouse(collection.length);

  // ゲーム中の文字サイズ
  const wordCharSize = level===1 ? 56 : level===4 ? 36 : 44;

  // ずかんのレア度ごと集計
  const catsByRarity = useMemo(() => {
    const m = {};
    for (const r of RARITY_ORDER) m[r] = [];
    for (const c of CATS) m[c.r].push(c);
    return m;
  }, []);
  const ownedByRarity = useMemo(() => {
    const m = {};
    for (const r of RARITY_ORDER) m[r] = 0;
    for (const c of collection) if (m[c.r] !== undefined) m[c.r]++;
    return m;
  }, [collection]);

  // 背景に敷く足跡パターン
  const pawBg = `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><g fill='%23FF8C42' opacity='0.08'><circle cx='30' cy='30' r='7'/><circle cx='22' cy='22' r='3.5'/><circle cx='38' cy='22' r='3.5'/><circle cx='24' cy='38' r='3.5'/><circle cx='36' cy='38' r='3.5'/><circle cx='100' cy='90' r='7'/><circle cx='92' cy='82' r='3.5'/><circle cx='108' cy='82' r='3.5'/><circle cx='94' cy='98' r='3.5'/><circle cx='106' cy='98' r='3.5'/></g></svg>`)}")`;

  return(
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Zen Maru Gothic','Rounded Mplus 1c',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700;900&display=swap" rel="stylesheet"/>
      <style>{`
        * { box-sizing:border-box; }
        body { margin:0; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        @keyframes popIn { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes bounceIn { 0% { transform:scale(0); } 50% { transform:scale(1.25); } 100% { transform:scale(1); } }
        @keyframes charBounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        @keyframes keyShake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-3px); } 75% { transform:translateX(3px); } }
        @keyframes keyPulse { 0%,100% { transform:scale(1); box-shadow:0 4px 0 ${T.primaryDark}, 0 0 0 4px rgba(255,140,66,0.35), 0 6px 14px rgba(255,140,66,0.4); }
          50% { transform:scale(1.06); box-shadow:0 4px 0 ${T.primaryDark}, 0 0 0 7px rgba(255,140,66,0.25), 0 6px 18px rgba(255,140,66,0.5); } }
        @keyframes keyFlash { 0% { background:${T.success}; color:#fff; transform:scale(1.1); } 100% { } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes gachaShake { 0% { transform:translateX(-3px) rotate(-2deg); } 100% { transform:translateX(3px) rotate(2deg); } }
        @keyframes gachaUltraShake { 0% { transform:translate(-4px,-2px) rotate(-3deg) scale(1); } 100% { transform:translate(4px,2px) rotate(3deg) scale(1.05); } }
        @keyframes gachaPop { 0% { transform:scale(0.3); opacity:0; } 60% { transform:scale(1.1); opacity:1; } 100% { transform:scale(1); opacity:1; } }
        @keyframes gachaPopUltra { 0% { transform:scale(0.2) rotate(-10deg); opacity:0; } 50% { transform:scale(1.2) rotate(3deg); opacity:1; } 80% { transform:scale(0.95) rotate(-1deg); } 100% { transform:scale(1) rotate(0); opacity:1; } }
        @keyframes auraGlow { 0%,100% { opacity:0.7; transform:scale(1); } 50% { opacity:1; transform:scale(1.08); } }
        @keyframes starBurst { 0% { opacity:0; transform:scale(0) translate(0,0); } 30% { opacity:1; transform:scale(1.2); } 100% { opacity:0; transform:scale(0.8) translate(${0}px,-20px); } }
        @keyframes confetti { 0% { transform:translateY(-20px) rotate(0); opacity:1; } 100% { transform:translateY(110vh) rotate(720deg); opacity:0.8; } }
        @keyframes cardFlash { 0%,100% { opacity:0; } 30% { opacity:1; } }
        @keyframes xpFloat {
          0% { opacity:0; transform:translateY(8px) scale(0.55); }
          20% { opacity:1; transform:translateY(-6px) scale(1.15); }
          60% { opacity:1; transform:translateY(-30px) scale(1); }
          100% { opacity:0; transform:translateY(-64px) scale(0.95); }
        }
        @keyframes comboPop {
          0% { opacity:0; transform:translate(-50%,10px) scale(0.5); }
          25% { opacity:1; transform:translate(-50%,-6px) scale(1.25); }
          60% { opacity:1; transform:translate(-50%,-20px) scale(1); }
          100% { opacity:0; transform:translate(-50%,-44px) scale(0.9); }
        }
        @keyframes sparklePop {
          0% { opacity:0; transform:translate(-50%,-50%) scale(0); }
          20% { opacity:1; transform:translate(-50%,-50%) scale(1.35); }
          100% { opacity:0; transform:translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.3); }
        }

        .nt-btn {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          min-height:48px; padding:12px 24px;
          font-family:inherit; font-size:18px; font-weight:900;
          border:none; border-radius:16px; cursor:pointer;
          transition:transform 0.08s ease, box-shadow 0.08s ease;
          user-select:none; -webkit-tap-highlight-color:transparent;
          color:#fff;
        }
        .nt-btn:active { transform:translateY(4px); }
        .nt-btn:disabled { cursor:not-allowed; opacity:0.55; }
        .nt-btn-primary { background:${T.primary}; box-shadow:0 4px 0 ${T.primaryDark}, 0 6px 12px rgba(0,0,0,0.15); }
        .nt-btn-primary:hover:not(:disabled) { transform:translateY(2px); box-shadow:0 2px 0 ${T.primaryDark}, 0 3px 8px rgba(0,0,0,0.15); }
        .nt-btn-primary:active:not(:disabled) { box-shadow:0 0 0 ${T.primaryDark}; }
        .nt-btn-secondary { background:${T.secondary}; box-shadow:0 4px 0 ${T.secondaryDark}, 0 6px 12px rgba(0,0,0,0.15); }
        .nt-btn-secondary:hover:not(:disabled) { transform:translateY(2px); box-shadow:0 2px 0 ${T.secondaryDark}, 0 3px 8px rgba(0,0,0,0.15); }
        .nt-btn-secondary:active:not(:disabled) { box-shadow:0 0 0 ${T.secondaryDark}; }
        .nt-btn-xp { background:${T.xp}; color:${T.textMain}; box-shadow:0 4px 0 ${T.xpDark}, 0 6px 12px rgba(0,0,0,0.15); }
        .nt-btn-xp:hover:not(:disabled) { transform:translateY(2px); box-shadow:0 2px 0 ${T.xpDark}, 0 3px 8px rgba(0,0,0,0.15); }
        .nt-btn-xp:active:not(:disabled) { box-shadow:0 0 0 ${T.xpDark}; }
        .nt-btn-sub {
          min-height:40px; padding:8px 16px; font-size:14px;
          background:${T.card}; color:${T.textSub};
          box-shadow:0 3px 0 #D5D5D5, 0 4px 8px rgba(0,0,0,0.08);
        }
        .nt-btn-sub:hover { transform:translateY(2px); box-shadow:0 1px 0 #D5D5D5, 0 2px 6px rgba(0,0,0,0.08); }
        .nt-btn-sub:active { box-shadow:0 0 0 #D5D5D5; }
        .nt-btn-danger {
          min-height:40px; padding:6px 16px; font-size:13px;
          background:#FFFFFF; color:${T.textSub};
          box-shadow:0 3px 0 #DDD, 0 4px 8px rgba(0,0,0,0.06);
        }
        .nt-btn-danger:hover { transform:translateY(2px); box-shadow:0 1px 0 #DDD, 0 2px 6px rgba(0,0,0,0.06); }
        .nt-btn-danger:active { box-shadow:0 0 0 #DDD; }

        .nt-card {
          background:${T.card}; border-radius:16px; padding:16px;
          box-shadow:0 4px 16px rgba(0,0,0,0.08);
        }
        .nt-level-card {
          background:${T.card}; border:3px solid #EEE; border-radius:16px;
          padding:14px 16px; cursor:pointer; transition:transform 0.1s, box-shadow 0.1s, border-color 0.1s;
          text-align:center; min-height:48px;
          box-shadow:0 4px 0 #E5E5E5, 0 5px 10px rgba(0,0,0,0.06);
          font-family:inherit;
        }
        .nt-level-card:hover { transform:translateY(-2px); box-shadow:0 6px 0 #E5E5E5, 0 8px 14px rgba(0,0,0,0.08); }
        .nt-level-card.selected {
          border-color:${T.primary}; background:#FFF4EC;
          box-shadow:0 4px 0 ${T.primaryDark}, 0 6px 14px rgba(255,140,66,0.25);
        }

        .nt-shimmer {
          position:relative; overflow:hidden;
        }
        .nt-shimmer::before {
          content:""; position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
          background-size:200% 100%;
          animation:shimmer 2.5s linear infinite;
        }
      `}</style>

      {/* TITLE */}
      {screen==="title"&&(
        <div style={{minHeight:"100vh",padding:"20px 16px 28px",
          backgroundImage:pawBg, backgroundSize:"140px 140px",
          display:"flex",flexDirection:"column",alignItems:"center",
          animation:"fadeIn 0.3s"}}>

          <div style={{animation:"float 3s ease-in-out infinite",marginBottom:4}}>
            <CatFace cat={CATS[0]} size={96}/>
          </div>

          <h1 style={{fontSize:40,fontWeight:900,color:T.textMain,margin:"4px 0 0",
            textShadow:"0 3px 0 #FFE4CC, 0 5px 10px rgba(255,140,66,0.3)",
            letterSpacing:1}}>
            🐾 ねこあつめ
          </h1>
          <h2 style={{fontSize:28,fontWeight:900,color:T.primary,margin:"0 0 14px",
            textShadow:"0 2px 0 #FFE4CC"}}>
            タイピング
          </h2>

          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:16}}>
            <div style={{background:T.card,borderRadius:16,padding:"10px 16px",fontSize:13,fontWeight:700,
              color:T.textSub,boxShadow:"0 3px 10px rgba(0,0,0,0.06)"}}>
              🏠 <b style={{color:T.textMain}}>{house.name}</b>
            </div>
            <div style={{background:T.card,borderRadius:16,padding:"10px 16px",fontSize:13,fontWeight:700,
              color:T.textSub,boxShadow:"0 3px 10px rgba(0,0,0,0.06)"}}>
              🐱 <b style={{color:T.textMain}}>{collection.length}</b>ひき
            </div>
            <div style={{background:T.card,borderRadius:16,padding:"10px 16px",fontSize:13,fontWeight:700,
              color:T.textSub,boxShadow:"0 3px 10px rgba(0,0,0,0.06)"}}>
              💰 <b style={{color:T.textMain}}>{xp}</b> XP
            </div>
          </div>

          <p style={{fontSize:14,color:T.textSub,textAlign:"center",maxWidth:320,lineHeight:1.7,
            margin:"0 0 18px",fontWeight:700}}>
            タイピングでXPをためてガチャをまわそう！<br/>ねこがふえるとおうちもグレードアップ！
          </p>

          <div style={{width:"100%",maxWidth:520,marginBottom:20}}>
            <div style={{fontSize:16,fontWeight:900,color:T.textMain,textAlign:"center",marginBottom:10}}>
              レベルをえらぼう
            </div>
            <div style={{display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",
              gap:10}}>
              {Object.entries(WORDS).map(([lv,data])=>{
                const lvn = Number(lv);
                return(
                  <button key={lv} onClick={()=>setLevel(lvn)}
                    className={`nt-level-card${level===lvn?" selected":""}`}>
                    <div style={{fontSize:14,fontWeight:900,color:level===lvn?T.primary:T.textSub,marginBottom:4}}>
                      Lv.{lv}
                    </div>
                    <div style={{fontSize:22,fontWeight:900,color:T.textMain,
                      fontFamily:"monospace",margin:"6px 0 4px",letterSpacing:1}}>
                      {LEVEL_SAMPLES[lv]}
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:T.textSub,lineHeight:1.3}}>
                      {data.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button className="nt-btn nt-btn-primary" style={{padding:"16px 44px",fontSize:20,minWidth:220}}
            onClick={()=>{setWord(null);setTyped("");setCombo(0);setCorrect(0);setMiss(0);setScreen("game");}}>
            ▶ はじめる
          </button>

          <div style={{display:"flex",gap:12,marginTop:18,flexWrap:"wrap",justifyContent:"center"}}>
            <button className="nt-btn nt-btn-secondary" onClick={()=>setScreen("zukan")}>
              📖 ねこずかん ({collection.length}/{CATS.length})
            </button>
            <button className="nt-btn nt-btn-xp" onClick={()=>setScreen("house")}>
              🏠 おうちをみる
            </button>
          </div>

          <div style={{marginTop:16,fontSize:13,fontWeight:700,color:T.textSub}}>
            🏆 そうXP: <b style={{color:T.textMain,fontSize:16}}>{totalXp}</b>
          </div>

          <button className="nt-btn-danger" onClick={resetData} style={{marginTop:20,fontFamily:"inherit",border:"none",borderRadius:12,cursor:"pointer"}}>
            🗑️ データをリセット
          </button>
        </div>
      )}

      {/* GAME */}
      {screen==="game"&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",minHeight:"100vh",
          padding:"14px 12px 14px",animation:"fadeIn 0.3s"}}>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            width:"100%",maxWidth:520,marginBottom:10,gap:8}}>
            <button className="nt-btn nt-btn-sub" onClick={()=>setScreen("title")}>← もどる</button>
            <div style={{fontSize:14,color:T.textMain,fontWeight:900,
              background:T.card,padding:"8px 14px",borderRadius:12,
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              Lv.{level}　{WORDS[level].label}
            </div>
          </div>

          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",justifyContent:"center"}}>
            {[
              {l:"XP",v:xp,col:T.xp,dark:T.xpDark},
              {l:"コンボ",v:combo,col:T.combo,dark:T.comboDark},
              {l:"せいかい",v:correct,col:T.success,dark:T.successDark},
              {l:"ミス",v:miss,col:T.error,dark:T.errorDark},
            ].map(s=>(
              <div key={s.l} style={{background:T.card,borderRadius:12,padding:"8px 14px",
                textAlign:"center",minWidth:72,
                boxShadow:`0 3px 0 ${s.dark}22, 0 4px 10px rgba(0,0,0,0.06)`,
                borderTop:`3px solid ${s.col}`}}>
                <div style={{fontSize:13,color:T.textSub,fontWeight:700}}>{s.l}</div>
                <div style={{fontSize:26,fontWeight:900,color:s.col,lineHeight:1.1}}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{width:"100%",maxWidth:360,height:22,borderRadius:12,
            background:"#EEE",overflow:"hidden",marginBottom:8,position:"relative",
            boxShadow:"inset 0 2px 4px rgba(0,0,0,0.1)"}}>
            <div style={{height:"100%",borderRadius:12,
              background:`linear-gradient(90deg,${T.xp},${T.primary})`,
              width:`${Math.min((xp/GACHA_COST)*100,100)}%`,
              transition:"width 0.3s"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:13,fontWeight:900,color:T.textMain}}>
              {xp}/{GACHA_COST} XP
            </div>
          </div>

          <button className="nt-btn nt-btn-xp"
            onClick={doGacha} disabled={xp<GACHA_COST}
            style={{marginBottom:14,animation:xp>=GACHA_COST?"pulse 1.5s infinite":"none"}}>
            🎰 ガチャをまわす！
          </button>

          {/* 打つ文字カード + エフェクト（オーバーレイ） */}
          <div style={{position:"relative",marginBottom:14}}>
            <div className="nt-card" style={{
              padding:"18px 28px",textAlign:"center",
              width:360,maxWidth:"95vw",boxSizing:"border-box"}}>
              <div style={{fontSize:13,color:T.textSub,marginBottom:8,fontWeight:700}}>
                つぎのもじをうとう！
              </div>
              {/* ひらがな（Lv.1はなし） */}
              {word && word.hira ? (
                <div style={{
                  fontSize:Math.round(wordCharSize*0.7),
                  color:"#888",fontWeight:700,
                  letterSpacing:6,lineHeight:1.1,marginBottom:4,
                  fontFamily:"'Zen Maru Gothic',sans-serif"}}>
                  {word.hira}
                </div>
              ) : null}
              {/* ローマ字 */}
              <div style={{fontSize:wordCharSize,fontWeight:900,
                letterSpacing:level===1?0:8,display:"flex",
                justifyContent:"center",alignItems:"center",gap:level===1?0:4,
                fontFamily:"monospace",lineHeight:1.1,minHeight:wordCharSize*1.15}}>
                {word && word.roma.split("").map((ch,i)=>{
                  const isDone = i<typed.length;
                  const isCur = i===typed.length;
                  return(
                    <span key={i} style={{
                      color: isDone ? T.success : isCur ? T.primary : "#D0D0D0",
                      fontWeight: isDone ? 900 : isCur ? 900 : 700,
                      textDecoration: isCur ? "underline" : "none",
                      textDecorationThickness: 4,
                      textUnderlineOffset: 8,
                      textDecorationColor: T.primary,
                      display: "inline-block",
                      animation: isCur ? "charBounce 0.8s ease-in-out infinite" : "none",
                    }}>{ch}</span>
                  );
                })}
              </div>
            </div>

            {/* 正解エフェクト（レイアウト非干渉） */}
            <div aria-hidden style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"visible",zIndex:5}}>
              {flashId>0 && <>
                {/* カード全体の光フラッシュ */}
                <div key={`flash-${flashId}`} style={{
                  position:"absolute",inset:0,borderRadius:16,
                  boxShadow:`0 0 30px 10px rgba(255,255,255,0.9), 0 0 70px 22px ${T.xp}88, 0 0 100px 30px ${T.primary}44`,
                  animation:"cardFlash 0.35s ease-out forwards",
                  opacity:0
                }}/>
                {/* +XP テキスト（右上、上へふわっと） */}
                <div key={`xp-${flashId}`} style={{
                  position:"absolute",top:-6,right:-10,
                  padding:"8px 14px",
                  background:`linear-gradient(135deg,${T.xp},${T.primary})`,
                  color:"#fff",fontWeight:900,fontSize:22,
                  borderRadius:14,whiteSpace:"nowrap",
                  boxShadow:`0 4px 12px rgba(255,140,66,0.5)`,
                  textShadow:"0 1px 2px rgba(0,0,0,0.2)",
                  animation:"xpFloat 1s ease-out forwards",
                  opacity:0
                }}>+{flashData.xp} XP!</div>
                {/* コンボ（5以上） */}
                {flashData.combo>=5 && (
                  <div key={`combo-${flashId}`} style={{
                    position:"absolute",top:-34,left:"50%",
                    padding:"6px 18px",
                    background:T.combo,color:"#fff",
                    fontWeight:900,fontSize:20,borderRadius:14,whiteSpace:"nowrap",
                    boxShadow:`0 4px 0 ${T.comboDark}, 0 6px 14px rgba(255,105,180,0.45)`,
                    animation:"comboPop 1s ease-out forwards",
                    opacity:0
                  }}>🔥 {flashData.combo} COMBO!</div>
                )}
                {/* キラキラ放射 */}
                {Array.from({length:10}).map((_,i)=>{
                  const angle = (i*36 + (flashId*13)%36) * Math.PI/180;
                  const dist = 90 + (i%3)*12;
                  const dx = Math.cos(angle)*dist;
                  const dy = Math.sin(angle)*dist - 8;
                  return(
                    <span key={`spk-${flashId}-${i}`} style={{
                      position:"absolute",left:"50%",top:"50%",
                      fontSize:18,lineHeight:1,
                      "--tx":`${dx}px`,"--ty":`${dy}px`,
                      animation:`sparklePop 0.8s ${i*0.02}s ease-out forwards`,
                      opacity:0
                    }}>✨</span>
                  );
                })}
              </>}
            </div>
          </div>

          {/* キーボード */}
          <div style={{background:T.card,borderRadius:16,padding:"12px 10px",
            maxWidth:480,width:"100%",
            boxShadow:"0 4px 14px rgba(0,0,0,0.08)"}}>
            {KB.map((row,ri)=>(
              <div key={ri} style={{display:"flex",justifyContent:"center",gap:6,
                marginBottom:ri<2?6:0,paddingLeft:ri===1?20:ri===2?40:0}}>
                {row.map(key=>{
                  const isT = word && word.roma[typed.length]===key;
                  const isS = shakeKey===key;
                  const isF = flashKey===key;
                  const bg = isS ? T.error : isF ? T.success : isT ? T.primary : T.keyBg;
                  const col = (isS||isF||isT) ? "#FFF" : T.keyText;
                  const shadowDark = isS ? T.errorDark : isF ? T.successDark : isT ? T.primaryDark : "#C0C0C0";
                  return(
                    <div key={key} style={{
                      width:40,height:40,borderRadius:10,display:"flex",
                      alignItems:"center",justifyContent:"center",
                      fontSize:18,fontWeight:900,background:bg,color:col,
                      fontFamily:"monospace",
                      boxShadow: isT
                        ? `0 4px 0 ${T.primaryDark}, 0 0 0 4px rgba(255,140,66,0.35), 0 6px 14px rgba(255,140,66,0.4)`
                        : `0 3px 0 ${shadowDark}, 0 4px 6px rgba(0,0,0,0.08)`,
                      animation: isS ? "keyShake 0.1s 3"
                               : isT ? "keyPulse 1.1s infinite"
                               : "none",
                      transform: isT ? "scale(1.08)" : "scale(1)",
                      transition: "background 0.1s, color 0.1s, transform 0.1s",
                    }}>{key}</div>
                  );
                })}
              </div>
            ))}
            <div style={{textAlign:"center",fontSize:13,color:T.textSub,marginTop:10,fontWeight:700}}>
              ⬆ ひかっているキーをおしてね！
            </div>
          </div>

          {collection.length>0&&<div style={{marginTop:14,display:"flex",gap:6,
            flexWrap:"wrap",justifyContent:"center",maxWidth:360}}>
            {collection.slice(-6).map(cat=>(
              <div key={cat.id} style={{animation:"float 3s ease-in-out infinite",
                animationDelay:`${cat.id*0.2}s`}}>
                <CatFace cat={cat} size={32}/>
              </div>
            ))}
            {collection.length>6&&<div style={{fontSize:13,color:T.textSub,
              display:"flex",alignItems:"center",fontWeight:900}}>+{collection.length-6}</div>}
          </div>}
        </div>
      )}

      {/* ZUKAN */}
      {screen==="zukan"&&(
        <div style={{minHeight:"100vh",padding:"16px 14px 24px",animation:"fadeIn 0.3s",
          backgroundImage:pawBg, backgroundSize:"140px 140px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            maxWidth:640,margin:"0 auto 18px",gap:10}}>
            <button className="nt-btn nt-btn-sub" onClick={()=>setScreen("title")}>← もどる</button>
            <div style={{fontSize:22,fontWeight:900,color:T.textMain}}>📖 ねこずかん</div>
            <div style={{fontSize:14,fontWeight:900,color:T.primary,
              background:T.card,padding:"8px 14px",borderRadius:12,
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              {collection.length}/{CATS.length}
            </div>
          </div>

          <div style={{maxWidth:640,margin:"0 auto",display:"flex",flexDirection:"column",gap:20}}>
            {RARITY_ORDER.map(r=>{
              const rare = RARITY[r];
              const cats = catsByRarity[r];
              const ownedN = ownedByRarity[r];
              const shimmer = rare.glow;
              return(
                <div key={r}>
                  <div style={{
                    display:"flex",alignItems:"center",gap:12,
                    background:rare.color,
                    borderRadius:12,padding:"10px 16px",marginBottom:10,
                    boxShadow:`0 4px 0 ${rare.dark}, 0 6px 14px rgba(0,0,0,0.1)`,
                  }}>
                    <span style={{fontSize:20,fontWeight:900,color:"#fff",
                      letterSpacing:1, textShadow:`0 2px 0 ${rare.dark}`}}>
                      {r}
                    </span>
                    <span style={{fontSize:18,fontWeight:900,color:"#fff",
                      textShadow:`0 2px 0 ${rare.dark}`}}>
                      {rare.label}
                    </span>
                    <span style={{marginLeft:"auto",fontSize:16,fontWeight:900,
                      color:"#fff",background:rare.dark,
                      padding:"4px 12px",borderRadius:12}}>
                      {ownedN}/{cats.length}
                    </span>
                  </div>
                  <div style={{display:"grid",
                    gridTemplateColumns:"repeat(auto-fill,minmax(104px,1fr))",gap:10}}>
                    {cats.map(cat=>{
                      const owned = collection.find(c=>c.id===cat.id);
                      return(
                        <div key={cat.id} className={owned&&shimmer?"nt-shimmer":""} style={{
                          background: owned ? T.card : "#F2F2F2",
                          borderRadius:12,padding:"10px 6px",textAlign:"center",
                          border:`3px solid ${owned?rare.color:"#DDD"}`,
                          opacity:owned?1:0.55,
                          boxShadow: owned
                            ? `0 3px 0 ${rare.dark}33, 0 4px 10px rgba(0,0,0,0.08)`
                            : "none",
                        }}>
                          {owned?(<>
                            <CatFace cat={cat} size={48}/>
                            <div style={{fontSize:12,fontWeight:900,color:T.textMain,
                              marginTop:6,lineHeight:1.25,minHeight:30}}>{cat.name}</div>
                            <div style={{fontSize:13,fontWeight:900,color:rare.dark,marginTop:2}}>{cat.r}</div>
                          </>):(<>
                            <div style={{fontSize:36,opacity:0.35,lineHeight:1}}>❓</div>
                            <div style={{fontSize:12,fontWeight:900,color:"#AAA",marginTop:10}}>？？？</div>
                            <div style={{fontSize:13,fontWeight:900,color:"#BBB",marginTop:2}}>{cat.r}</div>
                          </>)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HOUSE */}
      {screen==="house"&&<HouseView collection={collection} onBack={()=>setScreen("title")}/>}

      {/* GACHA */}
      {gachaCat&&<GachaModal cat={gachaCat} isNew={gachaNew} onClose={()=>setGachaCat(null)}/>}
    </div>
  );
}
