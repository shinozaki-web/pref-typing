export interface Prefecture {
  id: string;       // romaji (matches @svg-maps/japan IDs)
  code: number;
  name: string;
  romaji: string;
  region: string;
  hints: {
    lv1: string;
    lv2: string;
    lv3: string;
  };
}

export const PREFECTURES: Prefecture[] = [
  {
    id: "hokkaido", code: 1, name: "北海道", romaji: "hokkaido", region: "北海道",
    hints: {
      lv1: "じゃがいもとたまねぎの生産量が日本一！広大な大地が広がる",
      lv2: "日本で一番面積が広い都道府県。本州の北にある島",
      lv3: "ほっ○○○",
    },
  },
  {
    id: "aomori", code: 2, name: "青森県", romaji: "aomori", region: "東北",
    hints: {
      lv1: "りんごの生産量が日本一！ねぶた祭りが有名",
      lv2: "東北地方の最北端。津軽海峡をはさんで北海道と向き合う",
      lv3: "あ○○り県",
    },
  },
  {
    id: "iwate", code: 3, name: "岩手県", romaji: "iwate", region: "東北",
    hints: {
      lv1: "面積が全国2位の広い県。わんこそばが有名",
      lv2: "東北地方の太平洋側。県庁所在地は盛岡市",
      lv3: "い○て県",
    },
  },
  {
    id: "miyagi", code: 4, name: "宮城県", romaji: "miyagi", region: "東北",
    hints: {
      lv1: "ずんだもちが有名！東北最大の都市・仙台市がある",
      lv2: "東北地方の太平洋側。松島は日本三景のひとつ",
      lv3: "み○ぎ県",
    },
  },
  {
    id: "akita", code: 5, name: "秋田県", romaji: "akita", region: "東北",
    hints: {
      lv1: "なまはげで有名！きりたんぽ鍋も東北の名物",
      lv2: "東北地方の日本海側。秋田犬の故郷",
      lv3: "あ○た県",
    },
  },
  {
    id: "yamagata", code: 6, name: "山形県", romaji: "yamagata", region: "東北",
    hints: {
      lv1: "さくらんぼの生産量が日本一！山形牛も有名",
      lv2: "東北地方の内陸〜日本海側。山形花笠まつりが有名",
      lv3: "や○がた県",
    },
  },
  {
    id: "fukushima", code: 7, name: "福島県", romaji: "fukushima", region: "東北",
    hints: {
      lv1: "桃の生産量が日本一！会津若松の鶴ヶ城が有名",
      lv2: "東北地方の最南端。面積は全国3位の広い県",
      lv3: "ふく○ま県",
    },
  },
  {
    id: "ibaraki", code: 8, name: "茨城県", romaji: "ibaraki", region: "関東",
    hints: {
      lv1: "納豆の消費量・生産量が日本一！水戸の偕楽園は日本三名園",
      lv2: "関東地方の北東部。太平洋に面した農業が盛んな県",
      lv3: "い○らき県",
    },
  },
  {
    id: "tochigi", code: 9, name: "栃木県", romaji: "tochigi", region: "関東",
    hints: {
      lv1: "いちごの生産量が日本一！日光東照宮が有名",
      lv2: "関東地方の北部。海がない内陸県",
      lv3: "と○ぎ県",
    },
  },
  {
    id: "gunma", code: 10, name: "群馬県", romaji: "gunma", region: "関東",
    hints: {
      lv1: "こんにゃくの生産量が日本一！草津温泉が有名",
      lv2: "関東地方の北西部。海がない内陸県",
      lv3: "ぐん○県",
    },
  },
  {
    id: "saitama", code: 11, name: "埼玉県", romaji: "saitama", region: "関東",
    hints: {
      lv1: "海がない内陸県。深谷市はねぎの生産量が多い",
      lv2: "関東地方の中部。東京の北に隣接する",
      lv3: "さい○ま県",
    },
  },
  {
    id: "chiba", code: 12, name: "千葉県", romaji: "chiba", region: "関東",
    hints: {
      lv1: "落花生（ピーナッツ）の生産量が日本一！",
      lv2: "関東地方の東部。東京湾と太平洋に面した半島の県",
      lv3: "ち○県",
    },
  },
  {
    id: "tokyo", code: 13, name: "東京都", romaji: "tokyo", region: "関東",
    hints: {
      lv1: "日本の首都！国会議事堂や皇居がある",
      lv2: "関東地方の南部。日本で一番人口が多い都市",
      lv3: "とう○○都",
    },
  },
  {
    id: "kanagawa", code: 14, name: "神奈川県", romaji: "kanagawa", region: "関東",
    hints: {
      lv1: "横浜中華街が有名！横浜市は日本で2番目に人口が多い市",
      lv2: "関東地方の南部。東京の南に隣接する",
      lv3: "かな○わ県",
    },
  },
  {
    id: "niigata", code: 15, name: "新潟県", romaji: "niigata", region: "中部",
    hints: {
      lv1: "コシヒカリ発祥の地！お米の生産量が日本有数",
      lv2: "中部地方の日本海側。佐渡島も新潟県",
      lv3: "に○がた県",
    },
  },
  {
    id: "toyama", code: 16, name: "富山県", romaji: "toyama", region: "中部",
    hints: {
      lv1: "ホタルイカの漁獲量が日本一！富山湾は天然のいけす",
      lv2: "中部地方の日本海側。立山連峰が有名",
      lv3: "と○ま県",
    },
  },
  {
    id: "ishikawa", code: 17, name: "石川県", romaji: "ishikawa", region: "中部",
    hints: {
      lv1: "金沢市の兼六園は日本三名園のひとつ。加賀百万石",
      lv2: "中部地方の日本海側。能登半島が有名",
      lv3: "いし○わ県",
    },
  },
  {
    id: "fukui", code: 18, name: "福井県", romaji: "fukui", region: "中部",
    hints: {
      lv1: "恐竜の化石の発見数が日本一！眼鏡フレームの生産量が多い",
      lv2: "中部地方の日本海側。越前ガニが有名",
      lv3: "ふく○県",
    },
  },
  {
    id: "yamanashi", code: 19, name: "山梨県", romaji: "yamanashi", region: "中部",
    hints: {
      lv1: "ぶどうとももの生産量が日本一！富士山の一部がある",
      lv2: "中部地方の内陸県。海がない県",
      lv3: "やま○し県",
    },
  },
  {
    id: "nagano", code: 20, name: "長野県", romaji: "nagano", region: "中部",
    hints: {
      lv1: "レタスとセロリの生産量が日本一！スキーも有名",
      lv2: "中部地方の内陸県。海がない。日本アルプスがある",
      lv3: "な○の県",
    },
  },
  {
    id: "gifu", code: 21, name: "岐阜県", romaji: "gifu", region: "中部",
    hints: {
      lv1: "世界遺産の白川郷・合掌造りが有名。飛騨牛も有名",
      lv2: "中部地方の内陸県。海がない。岐阜城が有名",
      lv3: "ぎ○県",
    },
  },
  {
    id: "shizuoka", code: 22, name: "静岡県", romaji: "shizuoka", region: "中部",
    hints: {
      lv1: "お茶の生産量が日本一！富士山の一部がある",
      lv2: "中部地方の太平洋側。東京と大阪の間にある",
      lv3: "し○おか県",
    },
  },
  {
    id: "aichi", code: 23, name: "愛知県", romaji: "aichi", region: "中部",
    hints: {
      lv1: "自動車（トヨタ）の生産で有名！名古屋城がある",
      lv2: "中部地方の太平洋側。名古屋市がある工業の県",
      lv3: "あい○県",
    },
  },
  {
    id: "mie", code: 24, name: "三重県", romaji: "mie", region: "近畿",
    hints: {
      lv1: "伊勢神宮がある！真珠の養殖が有名",
      lv2: "近畿地方の東部。太平洋（伊勢湾・熊野灘）に面する",
      lv3: "み○県",
    },
  },
  {
    id: "shiga", code: 25, name: "滋賀県", romaji: "shiga", region: "近畿",
    hints: {
      lv1: "日本最大の湖・琵琶湖がある！県面積の約6分の1が湖",
      lv2: "近畿地方の内陸県。海がない。京都の東に隣接",
      lv3: "し○県",
    },
  },
  {
    id: "kyoto", code: 26, name: "京都府", romaji: "kyoto", region: "近畿",
    hints: {
      lv1: "794年から約1000年間日本の都だった！金閣寺・清水寺が有名",
      lv2: "近畿地方の中部。世界遺産が多い古都",
      lv3: "き○と府",
    },
  },
  {
    id: "osaka", code: 27, name: "大阪府", romaji: "osaka", region: "近畿",
    hints: {
      lv1: "たこ焼き・お好み焼きが有名！西日本最大の都市",
      lv2: "近畿地方の中部。大阪城が有名",
      lv3: "おお○か府",
    },
  },
  {
    id: "hyogo", code: 28, name: "兵庫県", romaji: "hyogo", region: "近畿",
    hints: {
      lv1: "神戸牛が有名！姫路城は世界遺産",
      lv2: "近畿地方の西部。日本海と瀬戸内海の両方に面する",
      lv3: "ひょう○県",
    },
  },
  {
    id: "nara", code: 29, name: "奈良県", romaji: "nara", region: "近畿",
    hints: {
      lv1: "奈良公園のシカと東大寺の大仏が有名！",
      lv2: "近畿地方の内陸県。海がない。710年に都が置かれた",
      lv3: "な○県",
    },
  },
  {
    id: "wakayama", code: 30, name: "和歌山県", romaji: "wakayama", region: "近畿",
    hints: {
      lv1: "みかんの生産量が日本一！梅干しも有名",
      lv2: "近畿地方の南部。高野山・熊野古道が有名",
      lv3: "わか○ま県",
    },
  },
  {
    id: "tottori", code: 31, name: "鳥取県", romaji: "tottori", region: "中国",
    hints: {
      lv1: "鳥取砂丘が有名！日本で一番人口が少ない県",
      lv2: "中国地方の日本海側。20世紀梨の産地",
      lv3: "とっ○り県",
    },
  },
  {
    id: "shimane", code: 32, name: "島根県", romaji: "shimane", region: "中国",
    hints: {
      lv1: "縁結びの出雲大社が有名！日本で2番目に人口が少ない県",
      lv2: "中国地方の日本海側。松江城は現存する天守閣のひとつ",
      lv3: "し○ね県",
    },
  },
  {
    id: "okayama", code: 33, name: "岡山県", romaji: "okayama", region: "中国",
    hints: {
      lv1: "晴れの国おかやま！桃太郎伝説の地。マスカットが有名",
      lv2: "中国地方の瀬戸内海側。岡山城・後楽園が有名",
      lv3: "おか○ま県",
    },
  },
  {
    id: "hiroshima", code: 34, name: "広島県", romaji: "hiroshima", region: "中国",
    hints: {
      lv1: "かきの生産量が日本一！広島お好み焼きが有名",
      lv2: "中国地方の瀬戸内海側。原爆ドームは世界遺産",
      lv3: "ひろ○ま県",
    },
  },
  {
    id: "yamaguchi", code: 35, name: "山口県", romaji: "yamaguchi", region: "中国",
    hints: {
      lv1: "ふぐ（フク）料理が有名！本州の西の端",
      lv2: "中国地方の西端。九州（福岡）と関門海峡でつながる",
      lv3: "やま○ち県",
    },
  },
  {
    id: "tokushima", code: 36, name: "徳島県", romaji: "tokushima", region: "四国",
    hints: {
      lv1: "阿波踊りが有名！なると金時（さつまいも）も有名",
      lv2: "四国地方の東部。鳴門の渦潮が有名",
      lv3: "とく○ま県",
    },
  },
  {
    id: "kagawa", code: 37, name: "香川県", romaji: "kagawa", region: "四国",
    hints: {
      lv1: "讃岐うどんが有名！日本で一番面積が小さい県",
      lv2: "四国地方の北東部。瀬戸内海に面する",
      lv3: "か○わ県",
    },
  },
  {
    id: "ehime", code: 38, name: "愛媛県", romaji: "ehime", region: "四国",
    hints: {
      lv1: "みかんの生産量が全国上位！道後温泉が有名",
      lv2: "四国地方の北西部。瀬戸内海と宇和海に面する",
      lv3: "え○め県",
    },
  },
  {
    id: "kochi", code: 39, name: "高知県", romaji: "kochi", region: "四国",
    hints: {
      lv1: "かつおのたたきが有名！よさこい祭りも有名",
      lv2: "四国地方の南部。太平洋（土佐湾）に面する",
      lv3: "こう○県",
    },
  },
  {
    id: "fukuoka", code: 40, name: "福岡県", romaji: "fukuoka", region: "九州",
    hints: {
      lv1: "博多ラーメン・もつ鍋・明太子が有名！九州最大の都市",
      lv2: "九州地方の北部。韓国に最も近い県のひとつ",
      lv3: "ふく○か県",
    },
  },
  {
    id: "saga", code: 41, name: "佐賀県", romaji: "saga", region: "九州",
    hints: {
      lv1: "有田焼・伊万里焼など焼き物（陶磁器）が有名",
      lv2: "九州地方の北西部。玄界灘と有明海に面する",
      lv3: "さ○県",
    },
  },
  {
    id: "nagasaki", code: 42, name: "長崎県", romaji: "nagasaki", region: "九州",
    hints: {
      lv1: "島が多い県！江戸時代の出島で外国と貿易していた",
      lv2: "九州地方の西部。中国や韓国に近い",
      lv3: "なが○き県",
    },
  },
  {
    id: "kumamoto", code: 43, name: "熊本県", romaji: "kumamoto", region: "九州",
    hints: {
      lv1: "くまモンで有名！すいかの生産量が日本一",
      lv2: "九州地方の中部。阿蘇山がある",
      lv3: "くま○と県",
    },
  },
  {
    id: "oita", code: 44, name: "大分県", romaji: "oita", region: "九州",
    hints: {
      lv1: "温泉の数と湧出量が日本一！別府温泉が有名",
      lv2: "九州地方の東部。瀬戸内海と豊後水道に面する",
      lv3: "おお○た県",
    },
  },
  {
    id: "miyazaki", code: 45, name: "宮崎県", romaji: "miyazaki", region: "九州",
    hints: {
      lv1: "日南海岸が有名！プロ野球のキャンプ地として人気",
      lv2: "九州地方の南東部。太平洋に面する",
      lv3: "みや○き県",
    },
  },
  {
    id: "kagoshima", code: 46, name: "鹿児島県", romaji: "kagoshima", region: "九州",
    hints: {
      lv1: "桜島が有名！黒豚・さつまいも・鰹節の産地",
      lv2: "九州地方の南端。屋久島・種子島も鹿児島県",
      lv3: "か○しま県",
    },
  },
  {
    id: "okinawa", code: 47, name: "沖縄県", romaji: "okinawa", region: "沖縄",
    hints: {
      lv1: "日本最南端の県！サンゴ礁と美しい海が有名",
      lv2: "九州の南西。沖縄島を中心とした島々の県",
      lv3: "おき○わ県",
    },
  },
];

export const PREFECTURE_MAP: Record<string, Prefecture> =
  Object.fromEntries(PREFECTURES.map(p => [p.id, p]));

export function getRandomOrder(exclude: string[] = []): string[] {
  const ids = PREFECTURES.map(p => p.id).filter(id => !exclude.includes(id));
  return ids.sort(() => Math.random() - 0.5);
}
