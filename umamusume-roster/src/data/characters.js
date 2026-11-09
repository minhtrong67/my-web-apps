// Character names and icon files are indexed from https://umamusu.wiki/List_of_Characters
// Format: "Name" or "Name=IconFileName" when the wiki icon file name is irregular.

export const GROUPS = [
  { id: 'umamusume', color: '#e8509a' },
  { id: 'supporting', color: '#2f9be0' },
  { id: 'anime', color: '#8b5cf6' },
  { id: 'cinderella', color: '#6b7a90' },
  { id: 'starblossom', color: '#e0a100' }
];

const RAW = {
  umamusume: `Admire Groove;Admire Vega;Agnes Digital;Agnes Tachyon;Air Groove;Air Messiah;Air Shakur;Almond Eye;Aston Machan;Bamboo Memory;Believe;Biko Pegasus;Biwa Hayahide;Blast Onepiece;Bubble Gum Fellow;Buena Vista;Calstone Light O;Cesario;Cheval Grand;Chrono Genesis;Copano Rickey;Curren Bouquetd'or;Curren Chan;Daiichi Ruby;Daitaku Helios;Daiwa Scarlet;Dantsu Flame;Daring Heart;Daring Tact;Dream Journey;Duramente;Durandal;Efforia;Eishin Flash;El Condor Pasa;Epiphaneia;Espoir City;Fenomeno;Fine Motion;Forever Young;Fuji Kiseki;Furioso;Fusaichi Pandora;Gentildonna;Genuine;Gold City;Gold Ship;Gran Alegria;Grass Wonder;Haru Urara;Hishi Akebono;Hishi Amazon;Hishi Miracle;Hokko Tarumae;Ikuno Dictus;Inari One;Ines Fujin;Jungle Pocket;K.S.Miracle;Katsuragi Ace;Kawakami Princess;King Halo;Kiseki;Kitasan Black;Logotype;Loves Only You;Lucky Lilac;Manhattan Cafe;Marche Lorraine;Maruzensky;Marvelous Sunday;Matikanefukukitaru;Matikanetannhauser;Mayano Top Gun;Meisho Doto;Mejiro Ardan;Mejiro Bright;Mejiro Dober;Mejiro McQueen;Mejiro Palmer;Mejiro Ramonu;Mejiro Ryan;Mihono Bourbon;Mr. C.B.;Nakayama Festa;Narita Brian;Narita Taishin;Narita Top Road;Neo Universe;Nice Nature;Nishino Flower;No Reason;North Flight;Oguri Cap;Orfevre;Phalaenopsis;Red Desire;Rhein Kraft;Rice Shower;Rose Kingdom;Royce and Royce;Rulership;Sakura Bakushin O;Sakura Chitose O;Sakura Chiyono O;Sakura Laurel;Samson Big;Satono Crown;Satono Diamond;Seeking the Pearl;Seiun Sky;Shinko Windy;Silence Suzuka;Sirius Symboli;Smart Falcon;Sounds of Earth;Special Week;Stay Gold;Still in Love;Super Creek;Sweep Tosho;Symboli Kris S;Symboli Rudolf;T.M. Opera O;Taiki Shuttle;Tamamo Cross;Tanino Gimlet;Tap Dance City;Titleholder;Tokai Teio;Tosen Jordan;Transcend;Tsurumaru Tsuyoshi;Twin Turbo;Verxina;Victoire Pisa;Vivlos;Vodka;Win Marilyn;Win Variation;Winning Ticket;Wonder Acute;Yaeno Muteki;Yamanin Zephyr;Yukino Bijin;Zenno Rob Roy`,
  supporting: `Aoi Kiryuin;Azuma;Beauty Anshinzawa;Bitter Glasse;Byerley Turk;Casino Drive;Darley Arabian;Etsuko Otonashi;Godolphin Barb;Haiseiko;Happy Meek;Junko Hosoe;Kiyoko Hoshina;Light Hello;Little Cocon;Mei Satake;Misato Akasaka;Montjeu;Rigantona;Riko Kashimoto;Ryoka Tsurugi;Saint Lite;Sasami Anshinzawa;Sonon Elfie;Speed Symboli;ST-2;Sugar Lights;Tazuna Hayakawa;Tucker Bryne;Venus Paques;Yayoi Akikawa;Yunohana Bloom`,
  anime: `All Haiyu;Bravo Day;Broye=Broye(Icon).png;Daisangen;Divinity;Genjitsu Steal;Hana Toujou;Hard Control=Hard_Control_Icon.png;Kuronuma=Kuronuma_icon.jpg;Mai;Minamizaka;Nana Izumoto;Perry Steam=Perrysteam_icon.png;Queen Berry=QueenBerry.Icon.png;Read Fantasy;Relic Earth=Relic_Earth_Icon.png;Ribbon Pian=Ribbon_Pia_(Icon).png;Rionatal=Rionatal_Icon.png;River Light;Ru;Satono's Trainer;Shima;Sun Visor=Sunvisor_icon.png;To-Car;Trainer;Trainer Okita;Trainer Tanabe;Xbalanque`,
  cinderella: `Akitsu Teio=Akitsu_Teio_Icon.png;Be True On Pulse;Belno Light=Berno_Light_(Icon).png;Bethe Sugar;Black Ale=Blacky_Yell_(Icon).png;Bright Rock;Carrie's Room;Clarizza;Dicta Striker;Dynamu Heroine;Dynamu Painter;Ellerslie Pride;Eve Binti;Face No More;Folkqueen;Fujimasa March;Fumino Nase;Fuyuno Nakasumi;Ginjirou Musaka;God Hannibal;Hidehito Nase;Hiyori Kawamura;Jo Kitahara;Joy Maker;Kouichi Shibasaki;Kraft Univer;Long Live Free;Lord Royal=Road_Royal_(Icon).png;Luna Swallow;Masami Komiyama;Massive Viking;Meikun Tsukasa;Merry Beauty;Meteor Selenus;Michelle My Baby;Mill Wakaba;Mini the Lady;Miss Armagnac;Moonlight Lunacy;Norn Ace;Obey Your Master;Okan Maker;Romance Bubbly;Royal Cherry;Rudy Lemono;Run to the Top;Satias;School Road;Sekai Touha;Sensuke Fujii=Fujii_Sensuke_(Icon).png;Shirley Sky;Shirogane Adieu=Shirogane_Adieu_Icon.png;South Heroine;Tadashi Kouchi;Thief Crow;Toni Bianca=Toni_Bianca_(Icon-copy).png;Top Shunbetsu;Ultra Ichiban;Walk Dancer;Yamano Thousand=Yamano_Thousand's_icon.png`,
  starblossom: `Alter the Soul=Alter_the_Soul_(icon).png;Amagi Happiness;Celestial Pole=Celestial_Pole_(Main).png;Dance Limerick=Dance_Limerick_(Icon).jpg;Dear Charlotte=Dear_Charlotte_(Icon).jpg;Eastern Riddle;Final Third;Gorou Akeishi;Iris Cider=Iris_Cider_(Icon).jpg;Ishigami Isao=Ishigami_Isao_(Icon).jpg;Julius Lucor=Julius_Lucor_Icon.png;Matsukaze Ryu O=Matsukaze_Ryu_O_(Icon).jpg;Miyu Kuroda=Miyu_Kuroda_(Main).jpg;Momo;Monsieur Sucre;North Flight's Trainer;Saki Abukuma=Saki_Abukuma_(Main).jpg;Sakura Bakushin O's Sub-Trainer=Sakura_Bakushin_O's_Trainer_(Icon).png;Shizuno Hayato=Shizuno_Hayato_Icon.png;Snow in Hazard;Stella Girl=Dassadadsasddsaads.png;Sugar Nation;Sugar Safety;Sundance Blaze;Trainer Kawase;Trainer Saruno;Tsubaki Akeishi;Yoshino Prevail`
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const CHARACTERS = GROUPS.flatMap((g) =>
  RAW[g.id]
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      const [name, file] = item.split('=');
      return { name, group: g.id, file: file || `${name.replace(/ /g, '_')}_(Icon).png` };
    })
).map((c, i) => ({ ...c, id: slug(c.name), no: i + 1, initial: c.name[0].toUpperCase(), prefix: c.name.split(' ')[0].replace(/'s$/, '') }));

const STOP = new Set(['Trainer', 'Mr.', 'The']);
const counts = new Map();
CHARACTERS.forEach((c) => { if (c.name.includes(' ') && !STOP.has(c.prefix)) counts.set(c.prefix, (counts.get(c.prefix) || 0) + 1); });
export const PREFIXES = [...counts].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count }));
export const LETTERS = [...new Set(CHARACTERS.map((c) => c.initial))].sort();

const enc = (f) => encodeURIComponent(f).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27');
export const iconUrl = (c, w = 240) => `https://umamusu.wiki/w/thumb.php?f=${enc(c.file)}&width=${w}`;
export const wikiUrl = (c) => `https://umamusu.wiki/${enc(c.name.replace(/ /g, '_'))}`;
export const fandomUrl = (c) => `https://umamusume.fandom.com/wiki/Special:Search?query=${encodeURIComponent(c.name)}`;
export const OFFICIAL_URL = 'https://umamusume.com/characters/';

// ---------- Profile data ----------
// Verified entries only. Sources: dbltap.com (birthday/height/sizes for the Global roster),
// GameTora character pages and umamusu.wiki infoboxes (Japanese name, voice actor, division, dorm, shoe size).
// Format: Name|MM-DD|height cm|bust-waist-hip|Japanese name|voice actor|division|dorm|shoe size
const PROFILES = `Agnes Tachyon|04-13|159|83-55-81
Air Groove|04-06|165|90-57-86
Biwa Hayahide|03-10|171|93-61-88
Curren Chan|03-31|155|83-55-79
Daiwa Scarlet|05-13|163|90-56-82|ダイワスカーレット||||24.5 cm
Eishin Flash|03-27|160|88-58-86
El Condor Pasa|03-17|163|89-58-86
Fuji Kiseki|04-15|168|84-58-82
Gold City|04-16|158|85-58-82
Gold Ship|03-06|170|88-55-88
Grass Wonder|02-18|152|77-53-84|||||L 23.0 cm / R 23.5 cm
Haru Urara|02-27|140|74-51-73
Hishi Amazon|03-26|160|92-59-89
King Halo|04-28|159|85-60-85
Maruzensky|05-19|164|92-58-88
Matikanefukukitaru|05-22|158|84-59-83
Mayano Top Gun|03-24|143|75-51-73
Meisho Doto|03-25|164|99-61-89
Mejiro McQueen|04-03|159|71-54-76
Mejiro Ryan|04-11|163|87-57-86
Mihono Bourbon|04-25|160|86-54-87
Narita Brian|05-03|160|91-58-85
Narita Taishin|06-10|145|69-50-73
Nice Nature|04-16|157|79-56-80
Oguri Cap|03-27|167|82-57-82
Rice Shower|03-05|145|75-51-76
Sakura Bakushin O|04-14|158|83-55-83
Seiun Sky|04-26|155|77-55-80
Silence Suzuka|05-01|161|70-53-79
Smart Falcon|04-04|156|78-55-80
Special Week|05-02|158|81-56-81|スペシャルウィーク|Azumi Waki
Super Creek|05-27|168|97-61-91
Symboli Rudolf|03-13|165|86-59-85
Taiki Shuttle|03-23|172|94-59-90||Yuka Ōtsubo
T.M. Opera O|03-13|156|76-55-80
Tokai Teio|04-20|150|77-54-76||Machico
Vodka|04-04|165|76-55-78
Winning Ticket|03-21|157|88-57-85
Matikanetannhauser|05-07|155|80-55-80|マチカネタンホイザ||junior|ritto
Admire Vega|03-12|157|85-57-82|アドマイヤベガ||senior|ritto|L/R 23.0 cm
Byerley Turk|02-24|167||バイアリーターク|斎賀みつき
Bitter Glasse|04-01|||ビターグラッセ|Aino Shimada
Etsuko Otonashi|05-03|168||乙名史記者|Emiri Suyama
Genuine|04-28|157|87-58-86||Mirii Fukushima`;

const PMAP = {};
PROFILES.split('\n').forEach((line) => {
  const [name, birthday, height, sizes, jp, cv, school, dorm, shoe] = line.split('|');
  PMAP[name] = { birthday: birthday || null, height: height ? +height : null, sizes: sizes || null, jp: jp || null, cv: cv || null, school: school || null, dorm: dorm || null, shoe: shoe || null };
});
CHARACTERS.forEach((c) => { c.d = PMAP[c.name] || null; });
export const PROFILE_COUNT = CHARACTERS.filter((c) => c.d).length;

export const gametoraUrl = (c) => `https://gametora.com/umamusume/characters/${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
export const hasGametora = (c) => c.group === 'umamusume' || c.group === 'supporting';

export const bdayKey = (md) => { const [m, d] = md.split('-').map(Number); return m * 100 + d; };
export const formatBirthday = (md, lang) => { const [m, d] = md.split('-').map(Number); return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', day: 'numeric' }).format(new Date(2024, m - 1, d)); };
export const daysUntil = (md) => {
  const [m, d] = md.split('-').map(Number);
  const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let t = new Date(now.getFullYear(), m - 1, d);
  if (t < today) t = new Date(now.getFullYear() + 1, m - 1, d);
  return Math.round((t - today) / 86400000);
};
const SIGNS = [[1, 20, 'Aquarius'], [2, 19, 'Pisces'], [3, 21, 'Aries'], [4, 20, 'Taurus'], [5, 21, 'Gemini'], [6, 21, 'Cancer'], [7, 23, 'Leo'], [8, 23, 'Virgo'], [9, 23, 'Libra'], [10, 23, 'Scorpio'], [11, 22, 'Sagittarius'], [12, 22, 'Capricorn']];
export const ZODIAC_VI = { Aquarius: 'Bảo Bình', Pisces: 'Song Ngư', Aries: 'Bạch Dương', Taurus: 'Kim Ngưu', Gemini: 'Song Tử', Cancer: 'Cự Giải', Leo: 'Sư Tử', Virgo: 'Xử Nữ', Libra: 'Thiên Bình', Scorpio: 'Bọ Cạp', Sagittarius: 'Nhân Mã', Capricorn: 'Ma Kết' };
export const zodiac = (md) => {
  const [m, d] = md.split('-').map(Number);
  let s = 'Capricorn';
  for (const [sm, sd, name] of SIGNS) if (m > sm || (m === sm && d >= sd)) s = name;
  return s;
};
