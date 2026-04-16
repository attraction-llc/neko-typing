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
  1: { label:"かんたん（1もじ）", words:"asdfjklghtyrueiwoqpbnmcxzv".split("") },
  2: { label:"ふつう（2〜3もじ）", words:["ai","ue","ao","ka","ki","ku","ke","ko","sa","si","su","se","so","ta","ti","tu","te","to","na","ni","nu","ne","no","ha","hi","hu","he","ho","ma","mi","mu","me","mo","ya","yu","yo","ra","ri","ru","re","ro","wa","wo","nn"] },
  3: { label:"ちょいむず（たんご）", words:["neko","inu","sora","umi","yama","kawa","hana","mori","kaze","ame","yuki","hosi","tuki","kumo","niwa","mado","isu","mizu","ie","eki","mura","mati","kuni","sato","tori"] },
  4: { label:"むずかしい（ながいたんご）", words:["sakura","kodomo","tomodati","gakkou","sensee","ohayou","arigato","konnitiwa","nekosuki","sugoiyo","tanosii","uresii","ganbaru","okaasan","otoosan","oneesan","oniisan","purezento","keeki","oyasumi"] },
};
const KB = [["q","w","e","r","t","y","u","i","o","p"],["a","s","d","f","g","h","j","k","l"],["z","x","c","v","b","n","m"]];
const GACHA_COST = 50;
const HOUSES = [
  { name:"ダンボールハウス", need:0, bg:"#d2b48c", fl:"#c4a06a", items:[] },
  { name:"ちいさなおへや", need:5, bg:"#f5e6d0", fl:"#deb887", items:["rug"] },
  { name:"ねこカフェ", need:15, bg:"#fff0e0", fl:"#e8c8a0", items:["rug","shelf","plant"] },
  { name:"ねこ御殿", need:30, bg:"#fdf0e8", fl:"#d4a87a", items:["rug","shelf","plant","tower","sofa"] },
  { name:"ねこ城", need:50, bg:"#f8f0ff", fl:"#c8a8d8", items:["rug","shelf","plant","tower","sofa","chandelier","fountain"] },
];
function getHouse(n){ let h=HOUSES[0]; for(const x of HOUSES){if(n>=x.need)h=x;} return h; }

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

// ===== MINI CAT (image-based, rich animation) =====
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

  return (
    <g transform={`translate(${cx},${cy})`} style={{cursor:"pointer"}}
       onPointerDown={e => { e.stopPropagation(); onClick(); }}>
      <title>{cat.name}（{cat.r}）</title>
      <image href={cat.img} width="30" height="30" x="-15" y="-15"
        transform={`scale(${sx},${sy}) rotate(${rot})`}
        style={{pointerEvents:"auto"}}/>
      {sleeping && <text x="6" y="-12" fontSize="6" fill="#88a"
        opacity={0.5+Math.sin(tick*0.1)*0.5} fontWeight="bold">z</text>}
      {playing && tick%20<10 && <text x="-2" y="-18" fontSize="5" fill="#ffd93d">✦</text>}
      {sitting && tick%30<18 && <text x="-4" y="-16" fontSize="6" fill="#e17055">♪</text>}
      {stretching && tick%24<12 && <text x="-3" y="-18" fontSize="5" fill="#6bcb77" opacity="0.7">↕</text>}
      {grooming && tick%22<11 && <text x="-3" y="-16" fontSize="5" fill="#87ceeb" opacity="0.7">〜</text>}
      {chasing && tick%8<4 && <text x={-facing*10} y="-2" fontSize="5" fill="#e17055" opacity="0.6">💨</text>}

      {emotion && <text x="-5" y={-20 - Math.min(emoAge,10)*0.8} fontSize="10" opacity={emoFade}>{emotion.icon}</text>}

      {speech && (() => {
        const w = Math.max(speech.text.length*5, cat.name.length*4.5+12) + 6;
        return (
          <g opacity={speechFade}>
            <rect x={-w/2} y="-40" width={w} height="18" fill="#fff" stroke="#e17055" strokeWidth="0.6" rx="5"/>
            <polygon points={`${-3},-22 0,-19 3,-22`} fill="#fff" stroke="#e17055" strokeWidth="0.6"/>
            <text x="0" y="-32" fontSize="6" fill="#e17055" textAnchor="middle" fontWeight="bold">{speech.text}</text>
            <text x="0" y="-25" fontSize="4" fill="#636e72" textAnchor="middle">{cat.name} {cat.r}</text>
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

  const skyFill = timeMode==="day" ? "#87ceeb"
                : timeMode==="sunset" ? "linear-gradient(180deg,#ff9a7b,#ffcc88)"
                : "#1a1a3a";

  return(
    <div style={{ minHeight:"100vh",
      background:`linear-gradient(180deg,${timeMode==="day"?"#87ceeb":timeMode==="sunset"?"#ffa07a":"#1a1a3a"} 0%,${timeMode==="day"?"#b0d8f0":timeMode==="sunset"?"#ffc89a":"#2a2a5a"} 40%,${house.bg} 40%)`,
      fontFamily:"'Zen Maru Gothic',sans-serif", animation:"fadeIn 0.4s ease", transition:"background 2s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px" }}>
        <button onClick={onBack} style={{ padding:"6px 16px", fontSize:12, background:"rgba(255,255,255,0.8)",
          border:"none", borderRadius:20, cursor:"pointer", fontFamily:"inherit", fontWeight:700, color:"#636e72" }}>← もどる</button>
        <div style={{ fontSize:16, fontWeight:900, color:timeMode==="night"?"#fff":"#2d3436" }}>🏠 {house.name}</div>
        <div style={{ fontSize:11, color:timeMode==="night"?"#dfe6e9":"#636e72" }}>{collection.length}ひき</div>
      </div>
      {nextH&&<div style={{ textAlign:"center", fontSize:11, color:"#636e72", marginBottom:8,
        background:"rgba(255,255,255,0.6)", padding:"4px 12px", borderRadius:12,
        display:"inline-block", marginLeft:"50%", transform:"translateX(-50%)" }}>
        あと{nextH.need-collection.length}ひきで「{nextH.name}」にグレードアップ！</div>}
      <div style={{ width:"100%", maxWidth:480, margin:"0 auto", padding:"0 8px" }}>
        <svg viewBox="0 0 300 200" style={{ width:"100%", borderRadius:16, background:house.bg,
          boxShadow:"0 4px 20px rgba(0,0,0,0.15)", touchAction:"manipulation" }}>
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
          {/* Window with time-of-day scenery */}
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
          {collection.length===0&&<text x="150" y="110" textAnchor="middle" fontSize="10" fill="#999">まだねこがいないよ… ガチャでむかえよう！</text>}
        </svg>
      </div>
      <div style={{ maxWidth:480, margin:"12px auto 0", padding:"0 12px" }}>
        <div style={{ fontSize:10, color:"#636e72", textAlign:"center", marginBottom:6 }}>
          💡 ねこをタップするとリアクション！3かいタップでハート💕
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center",
          background:"rgba(255,255,255,0.7)", borderRadius:16, padding:12 }}>
          {collection.length>0?collection.map(cat=>(
            <div key={cat.id} style={{ background:"rgba(255,255,255,0.9)", borderRadius:10, padding:"4px 8px",
              textAlign:"center", fontSize:9, fontWeight:700, color:"#636e72", minWidth:50 }}>
              <div style={{ fontSize:10, color:cat.r.length>=4?"#e17055":"#333" }}>{cat.name}</div>
              <div style={{ fontSize:8, color:"#e17055" }}>{cat.r}</div>
            </div>
          )):<div style={{ fontSize:12, color:"#999", padding:20 }}>タイピングでXPをためてガチャをまわそう！</div>}
        </div>
      </div>
    </div>
  );
}

// ===== GACHA MODAL =====
function GachaModal({ cat, isNew, onClose }) {
  const [phase, setPhase] = useState(0);
  useEffect(()=>{const t=setTimeout(()=>setPhase(1),1500);return()=>clearTimeout(t);},[]);
  return(
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"fadeIn 0.3s" }}>
      <div style={{ background:phase===0?"radial-gradient(circle,#ffd93d,#ff9a3c)"
        :cat.r.length>=4?"radial-gradient(circle,#ffd700,#ff6b6b,#c77dff)":"radial-gradient(circle,#fff8e7,#ffeaa7)",
        borderRadius:24, padding:"36px 44px", textAlign:"center", minWidth:260,
        boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
        animation:phase===0?"shake 0.15s infinite alternate":"popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
        {phase===0?<div style={{fontSize:72,animation:"pulse 0.5s infinite"}}>🎁</div>:<>
          <div style={{fontSize:14,color:"#e74c3c",fontWeight:800,letterSpacing:2,marginBottom:6}}>
            {cat.r.length>=4?"🌟 ちょうレア！🌟":cat.r.length>=3?"✨ レア！✨":isNew?"🆕 NEW!":"もっているねこ"}</div>
          <CatFace cat={cat} size={100}/>
          <div style={{fontSize:20,fontWeight:900,marginTop:10,color:"#2d3436"}}>{cat.name}</div>
          <div style={{fontSize:18,color:"#e17055",marginTop:2}}>{cat.r}</div>
          <div style={{fontSize:12,color:"#636e72",marginTop:6}}>「{cat.d}」</div>
          <button onClick={onClose} style={{ marginTop:16,padding:"10px 30px",fontSize:15,fontWeight:700,
            background:"#6c5ce7",color:"#fff",border:"none",borderRadius:30,cursor:"pointer",
            fontFamily:"'Zen Maru Gothic',sans-serif",boxShadow:"0 4px 15px rgba(108,92,231,0.4)" }}>
            {isNew?"やったー！":"OK！"}</button>
        </>}
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
  const [word,setWord]=useState("");
  const [typed,setTyped]=useState("");
  const [combo,setCombo]=useState(0);
  const [correct,setCorrect]=useState(()=>loadFromStorage("correct",0));
  const [miss,setMiss]=useState(()=>loadFromStorage("miss",0));
  const [shakeKey,setShakeKey]=useState(null);
  const [sparkle,setSparkle]=useState(false);
  const [gachaCat,setGachaCat]=useState(null);
  const [gachaNew,setGachaNew]=useState(false);
  const [msg,setMsg]=useState("");

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
    const nx=word[typed.length];
    if(k===nx){
      const nw=typed+k;setTyped(nw);setCorrect(c=>c+1);
      setCombo(c=>c+1);
      if(nw===word){
        const bx=level*5+(combo>=5?5:0);
        setXp(x=>x+bx);setTotalXp(t=>t+bx);
        setSparkle(true);setMsg(`+${bx} XP!`);
        setTimeout(()=>{setSparkle(false);setMsg("")},800);
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

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#ffecd2 0%,#fcb69f 50%,#ff9a9e 100%)",
      fontFamily:"'Zen Maru Gothic','Rounded Mplus 1c',sans-serif",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700;900&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{transform:scale(0.3);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes shake{0%{transform:translateX(-3px) rotate(-2deg)}100%{transform:translateX(3px) rotate(2deg)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes bounceIn{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
      `}</style>

      {/* TITLE */}
      {screen==="title"&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:20,animation:"fadeIn 0.5s"}}>
          <div style={{animation:"float 3s ease-in-out infinite",marginBottom:8}}><CatFace cat={CATS[0]} size={80}/></div>
          <h1 style={{fontSize:32,fontWeight:900,color:"#2d3436",margin:"8px 0 2px"}}>🐾 ねこあつめ</h1>
          <h2 style={{fontSize:22,fontWeight:700,color:"#e17055",margin:"0 0 10px"}}>タイピング</h2>
          <div style={{background:"rgba(255,255,255,0.7)",borderRadius:14,padding:"8px 16px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#636e72"}}>🏠 おうち: <b>{house.name}</b> ｜ 🐱 {collection.length}ひき</div>
          </div>
          <p style={{fontSize:13,color:"#636e72",textAlign:"center",maxWidth:280,lineHeight:1.7,marginBottom:16}}>
            タイピングでXPをためてガチャをまわそう！<br/>ねこがふえるとおうちもレベルアップ！</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:280,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#2d3436",textAlign:"center"}}>レベルをえらぼう</div>
            {Object.entries(WORDS).map(([lv,data])=>(
              <button key={lv} onClick={()=>setLevel(Number(lv))} style={{
                padding:"10px 16px",border:"3px solid",borderColor:level===Number(lv)?"#e17055":"rgba(255,255,255,0.6)",
                borderRadius:14,background:level===Number(lv)?"linear-gradient(135deg,#e17055,#d63031)":"rgba(255,255,255,0.7)",
                color:level===Number(lv)?"#fff":"#2d3436",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                boxShadow:level===Number(lv)?"0 4px 12px rgba(225,112,85,0.4)":"none"
              }}>Lv.{lv}　{data.label}</button>
            ))}
          </div>
          <button onClick={()=>{setWord("");setTyped("");setCombo(0);setCorrect(0);setMiss(0);setScreen("game");}} style={{
            padding:"14px 44px",fontSize:18,fontWeight:900,background:"linear-gradient(135deg,#6c5ce7,#a29bfe)",
            color:"#fff",border:"none",borderRadius:50,cursor:"pointer",fontFamily:"inherit",
            boxShadow:"0 6px 20px rgba(108,92,231,0.5)"}}>▶ はじめる</button>
          <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={()=>setScreen("zukan")} style={{padding:"8px 18px",fontSize:12,fontWeight:700,
              background:"rgba(255,255,255,0.8)",color:"#6c5ce7",border:"2px solid #6c5ce7",borderRadius:30,cursor:"pointer",fontFamily:"inherit"}}>
              📖 ねこずかん ({collection.length}/{CATS.length})</button>
            <button onClick={()=>setScreen("house")} style={{padding:"8px 18px",fontSize:12,fontWeight:700,
              background:"rgba(255,255,255,0.8)",color:"#e17055",border:"2px solid #e17055",borderRadius:30,cursor:"pointer",fontFamily:"inherit"}}>
              🏠 おうちをみる</button>
          </div>
          <div style={{marginTop:10,fontSize:12,color:"#636e72"}}>🏆 そうXP: {totalXp}　|　💰 {xp} XP</div>
          <button onClick={resetData} style={{marginTop:18,padding:"6px 16px",fontSize:11,fontWeight:700,
            background:"rgba(255,255,255,0.5)",color:"#b2bec3",border:"1px solid #dfe6e9",borderRadius:20,
            cursor:"pointer",fontFamily:"inherit"}}>🗑️ データをリセット</button>
        </div>
      )}

      {/* GAME */}
      {screen==="game"&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",minHeight:"100vh",padding:"12px 12px 8px",animation:"fadeIn 0.3s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",maxWidth:460,marginBottom:8}}>
            <button onClick={()=>setScreen("title")} style={{padding:"5px 14px",fontSize:11,background:"rgba(255,255,255,0.7)",
              border:"none",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:700,color:"#636e72"}}>← もどる</button>
            <div style={{fontSize:11,color:"#2d3436",fontWeight:700}}>Lv.{level} {WORDS[level].label}</div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",justifyContent:"center"}}>
            {[{l:"XP",v:xp,col:"#ffd93d"},{l:"コンボ",v:combo,col:"#e17055"},{l:"せいかい",v:correct,col:"#6bcb77"},{l:"ミス",v:miss,col:"#ff7675"}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,0.85)",borderRadius:12,padding:"4px 12px",textAlign:"center",minWidth:55}}>
                <div style={{fontSize:10,color:"#636e72"}}>{s.l}</div>
                <div style={{fontSize:18,fontWeight:900,color:s.col}}>{s.v}</div>
              </div>))}
          </div>
          <div style={{width:"100%",maxWidth:310,height:16,borderRadius:10,background:"rgba(255,255,255,0.5)",overflow:"hidden",marginBottom:6,position:"relative"}}>
            <div style={{height:"100%",borderRadius:10,background:"linear-gradient(90deg,#ffd93d,#e17055)",width:`${Math.min((xp/GACHA_COST)*100,100)}%`,transition:"width 0.3s"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#2d3436"}}>{xp}/{GACHA_COST} XP</div>
          </div>
          <button onClick={doGacha} disabled={xp<GACHA_COST} style={{
            padding:"8px 24px",fontSize:14,fontWeight:900,
            background:xp>=GACHA_COST?"linear-gradient(135deg,#ffd93d,#e17055)":"rgba(200,200,200,0.5)",
            color:xp>=GACHA_COST?"#fff":"#aaa",border:"none",borderRadius:30,cursor:xp>=GACHA_COST?"pointer":"default",
            fontFamily:"inherit",marginBottom:10,animation:xp>=GACHA_COST?"pulse 1.5s infinite":"none",
            boxShadow:xp>=GACHA_COST?"0 4px 12px rgba(225,112,85,0.4)":"none"}}>🎰 ガチャをまわす！</button>
          {msg&&<div style={{fontSize:20,fontWeight:900,color:"#e17055",animation:"bounceIn 0.4s",marginBottom:4}}>{msg}</div>}
          <div style={{background:"rgba(255,255,255,0.9)",borderRadius:18,padding:"16px 24px",marginBottom:10,textAlign:"center",
            boxShadow:"0 4px 16px rgba(0,0,0,0.1)",minWidth:220,position:"relative",animation:sparkle?"shake 0.1s 2":undefined}}>
            {sparkle&&<div style={{position:"absolute",top:-8,right:-8,fontSize:24,animation:"bounceIn 0.5s"}}>✨</div>}
            <div style={{fontSize:11,color:"#b2bec3",marginBottom:6}}>つぎのもじをうとう！</div>
            <div style={{fontSize:level===1?44:32,fontWeight:900,letterSpacing:level===1?0:5,display:"flex",justifyContent:"center",gap:3}}>
              {word.split("").map((ch,i)=>(
                <span key={i} style={{color:i<typed.length?"#6bcb77":i===typed.length?"#e17055":"#dfe6e9",
                  textDecoration:i===typed.length?"underline":"none",textDecorationColor:"#e17055",textUnderlineOffset:5}}>{ch}</span>))}
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.75)",borderRadius:14,padding:"10px 6px",maxWidth:400,width:"100%"}}>
            {KB.map((row,ri)=>(
              <div key={ri} style={{display:"flex",justifyContent:"center",gap:3,marginBottom:ri<2?3:0,paddingLeft:ri===1?14:ri===2?28:0}}>
                {row.map(key=>{const isT=word[typed.length]===key;const isS=shakeKey===key;return(
                  <div key={key} style={{width:34,height:34,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,fontWeight:700,background:isT?"linear-gradient(135deg,#e17055,#d63031)":"#f0f0f0",
                    color:isT?"#fff":"#636e72",boxShadow:isT?"0 3px 8px rgba(225,112,85,0.5)":"0 2px 4px rgba(0,0,0,0.1)",
                    animation:isS?"shake 0.1s 3":isT?"pulse 1s infinite":"none",transform:isT?"scale(1.1)":"scale(1)",fontFamily:"monospace"}}>{key}</div>
                )})}</div>))}
            <div style={{textAlign:"center",fontSize:10,color:"#b2bec3",marginTop:6}}>⬆ ひかっているキーをおしてね！</div>
          </div>
          {collection.length>0&&<div style={{marginTop:8,display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center",maxWidth:360}}>
            {collection.slice(-6).map(cat=><div key={cat.id} style={{animation:"float 3s ease-in-out infinite",animationDelay:`${cat.id*0.2}s`}}><CatFace cat={cat} size={28}/></div>)}
            {collection.length>6&&<div style={{fontSize:10,color:"#636e72",display:"flex",alignItems:"center"}}>+{collection.length-6}</div>}
          </div>}
        </div>
      )}

      {/* ZUKAN */}
      {screen==="zukan"&&(
        <div style={{minHeight:"100vh",padding:16,animation:"fadeIn 0.3s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:460,margin:"0 auto 14px"}}>
            <button onClick={()=>setScreen("title")} style={{padding:"6px 16px",fontSize:12,background:"rgba(255,255,255,0.7)",
              border:"none",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:700,color:"#636e72"}}>← もどる</button>
            <div style={{fontSize:16,fontWeight:900,color:"#2d3436"}}>📖 ねこずかん</div>
            <div style={{fontSize:12,fontWeight:700,color:"#e17055"}}>{collection.length}/{CATS.length}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:6,maxWidth:460,margin:"0 auto"}}>
            {CATS.map(cat=>{const owned=collection.find(c=>c.id===cat.id);return(
              <div key={cat.id} style={{background:owned?"rgba(255,255,255,0.9)":"rgba(200,200,200,0.3)",
                borderRadius:12,padding:8,textAlign:"center",opacity:owned?1:0.4,
                boxShadow:owned?"0 2px 8px rgba(0,0,0,0.08)":"none"}}>
                {owned?<><CatFace cat={cat} size={40}/><div style={{fontSize:9,fontWeight:900,color:"#2d3436",marginTop:3,lineHeight:1.2}}>{cat.name}</div><div style={{fontSize:8,color:"#e17055"}}>{cat.r}</div></>
                :<><div style={{fontSize:28,opacity:0.3}}>❓</div><div style={{fontSize:9,fontWeight:700,color:"#b2bec3",marginTop:3}}>？？？</div><div style={{fontSize:8,color:"#dfe6e9"}}>{cat.r}</div></>}
              </div>);})}
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
