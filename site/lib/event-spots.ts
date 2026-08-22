export type EventSpotSeed = {
  id: string;
  country: string;
  city: string;
  name: string;
  lat: number;
  lng: number;
  spotKind: "permanent" | "limited";
  rewardKind: "gold_seedling" | "mixed";
  rewardSummary: string;
  startAt: number;
  endAt: number;
  cooldownNote: string;
  eligibilityNote: string;
  coordinateNote: string;
  verificationStatus: "official";
  sourceTitle: string;
  sourceUrl: string;
  lastVerifiedAt: number;
};

const seconds = (value: string) => Math.floor(Date.parse(value) / 1000);
const officialHelp = "https://niantic.helpshift.com/hc/en/23-pikmin-bloom/faq/3623-special-spot/?app_id=niantic_app_20191018003855906-90e74c8b4bfbc25&faq_id=niantic_faq_20210714025851089-b1376ee217dca25&is_preview=false&is_sdkx=false&language=en&platform_id=niantic_platform_20180726175230075-13b9ec875546270&platform_type=web";
const verified = seconds("2026-08-22T00:00:00Z");
const verified2 = seconds("2026-08-21T00:00:00Z");

// Coordinates identify the venue or published Special Spot area.  They are
// deliberately curated rather than inferred from scanner data; the game UI is
// still authoritative for the final interaction radius.
export const EVENT_SPOT_SEED: EventSpotSeed[] = [
  {
    id: "jp-nintendo-tokyo", country: "日本", city: "東京", name: "Nintendo TOKYO",
    lat: 35.661989, lng: 139.698784, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "澀谷 PARCO 6F 場館座標", verificationStatus: "official",
    sourceTitle: "Pikmin Bloom Help Center — Special Spot", sourceUrl: officialHelp, lastVerifiedAt: verified,
  },
  {
    id: "jp-nintendo-osaka", country: "日本", city: "大阪", name: "Nintendo OSAKA",
    lat: 34.70135, lng: 135.497, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "大丸梅田店 13F 場館座標", verificationStatus: "official",
    sourceTitle: "Pikmin Bloom Help Center — Special Spot", sourceUrl: officialHelp, lastVerifiedAt: verified,
  },
  {
    id: "jp-nintendo-kyoto", country: "日本", city: "京都", name: "Nintendo KYOTO",
    lat: 35.003075, lng: 135.768344, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "京都高島屋 S.C. 7F 場館座標", verificationStatus: "official",
    sourceTitle: "Pikmin Bloom Help Center — Special Spot", sourceUrl: officialHelp, lastVerifiedAt: verified,
  },
  {
    id: "jp-nintendo-fukuoka", country: "日本", city: "福岡", name: "Nintendo FUKUOKA",
    lat: 33.590059, lng: 130.400865, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "福岡 PARCO 場館座標", verificationStatus: "official",
    sourceTitle: "Nintendo FUKUOKA Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/news/nov25-nintendostore", lastVerifiedAt: verified,
  },
  {
    id: "jp-nintendo-museum", country: "日本", city: "宇治", name: "Nintendo Museum",
    lat: 34.892904, lng: 135.784188, spotKind: "permanent", rewardKind: "mixed",
    rewardSummary: "金色花苗（花牌飾品／金色禮物貼紙飾品）", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需預約及購票入館；以遊戲顯示為準",
    coordinateNote: "Nintendo Museum 場館座標", verificationStatus: "official",
    sourceTitle: "Nintendo Museum Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/news/oct24-nintendomuseum", lastVerifiedAt: verified,
  },
  {
    id: "jp-niantic-park", country: "日本", city: "東京", name: "Niantic Park（明治公園）",
    lat: 35.675424, lng: 139.71291, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "金色禮物貼紙飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "明治公園 Special Spot 場館座標", verificationStatus: "official",
    sourceTitle: "Niantic Park Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/news/nov24-nianticpark", lastVerifiedAt: verified,
  },
  {
    id: "jp-miyajima-terrace", country: "日本", city: "廿日市", name: "宮島服務區 Pikmin Terrace",
    lat: 34.365319, lng: 132.318022, spotKind: "limited", rewardKind: "mixed",
    rewardSummary: "紅色照片鈕扣徽章／運勢飾品皮克敏金色花苗", startAt: seconds("2026-05-01T00:00:00+09:00"), endAt: seconds("2027-03-31T23:59:59+09:00"),
    cooldownNote: "活動期間每個 Special Spot 限 1 次", eligibilityNote: "宮島服務區（下行線）戶外區域；以遊戲顯示為準",
    coordinateNote: "活動區域入口座標；兩個金盆 Spot 的實際位置請依遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "宮島服務區 Pikmin Terrace 官方活動公告", sourceUrl: "https://pikminbloom.com/zh/news/april26-miyajimasa", lastVerifiedAt: verified,
  },

  // ---- 美國 ----
  {
    id: "us-nintendo-newyork", country: "美國", city: "紐約", name: "Nintendo NEW YORK",
    lat: 40.758062, lng: -73.979482, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "10 Rockefeller Plaza 場館座標", verificationStatus: "official",
    sourceTitle: "Pikmin Bloom Help Center — Special Spot", sourceUrl: officialHelp, lastVerifiedAt: verified2,
  },
  {
    id: "us-seattle-aquarium-miniwalk", country: "美國", city: "西雅圖", name: "西雅圖水族館 MINI WALK（Pier 59-60）",
    lat: 47.607800, lng: -122.341400, spotKind: "limited", rewardKind: "gold_seedling",
    rewardSummary: "9 個 Special Spot，每處皮克敏金色花苗（對應各點裝飾，官方尚未公布明細）",
    startAt: seconds("2026-05-23T17:00:00Z"), endAt: seconds("2026-09-08T01:00:00Z"),
    cooldownNote: "每個 Special Spot 每 30 天最多 1 次", eligibilityNote: "活動期間西雅圖水族館 Pier 59、60 與 Ocean Pavilion 一帶；5/23-25、9/5-7 另有快閃帳篷與 AR 拍照活動",
    coordinateNote: "官方公告尚未公布 9 個 Special Spot 的個別座標（原文：a map featuring the Special Spots will be published at a later date），此處僅標示西雅圖水族館活動區域，實際點位請以遊戲地圖或官方後續公布地圖為準，切勿以掃描或猜測座標取代",
    verificationStatus: "official",
    sourceTitle: "Seattle Aquarium MINI WALK 官方活動公告", sourceUrl: "https://pikminbloom.com/news/may26-seattleminiwalk", lastVerifiedAt: verified2,
  },
  {
    id: "us-nintendo-sanfrancisco", country: "美國", city: "舊金山", name: "Nintendo SAN FRANCISCO",
    lat: 37.787780, lng: -122.408060, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅／黃／藍色禮物貼紙飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "331 Powell St 場館座標", verificationStatus: "official",
    sourceTitle: "Nintendo SAN FRANCISCO Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/may25-sfnintendo", lastVerifiedAt: verified2,
  },

  // ---- 台灣（永久 Special Spot，Nintendo 授權商品店） ----
  {
    id: "tw-shinkong-xinyi-a11", country: "台灣", city: "台北", name: "新光三越信義新天地 A11",
    lat: 25.033900, lng: 121.564500, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅／黃／藍色禮物貼紙飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "A11 館 Nintendo 授權商品店場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "台灣 Nintendo 授權商品店新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/june25-taiwan", lastVerifiedAt: verified2,
  },
  {
    id: "tw-syntrend", country: "台灣", city: "台北", name: "三創生活園區 SYNTREND",
    lat: 25.047800, lng: 121.529000, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅／黃／藍色禮物貼紙飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "SYNTREND Nintendo 授權商品店場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "台灣 Nintendo 授權商品店新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/june25-taiwan", lastVerifiedAt: verified2,
  },
  {
    id: "tw-lalaport-taichung", country: "台灣", city: "台中", name: "LaLaport 台中",
    lat: 24.147700, lng: 120.640300, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅／黃／藍色禮物貼紙飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "LaLaport 台中 Nintendo 授權商品店場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "台灣 Nintendo 授權商品店新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/june25-taiwan", lastVerifiedAt: verified2,
  },
  {
    id: "tw-taipei-underground-software-world", country: "台灣", city: "台北", name: "台北地下街軟體世界",
    lat: 25.047800, lng: 121.517700, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅／黃／藍色禮物貼紙飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "台北地下街軟體世界店場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "台灣 Nintendo 授權商品店新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/june25-taiwan", lastVerifiedAt: verified2,
  },
  {
    id: "tw-lalaport-nangang", country: "台灣", city: "台北", name: "LaLaport 南港",
    lat: 25.055900, lng: 121.616500, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅／黃／藍色禮物貼紙飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "LaLaport 南港 Nintendo 授權商品店場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "台灣 Nintendo 授權商品店新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/june25-taiwan", lastVerifiedAt: verified2,
  },
  {
    id: "tw-dream-mall", country: "台灣", city: "高雄", name: "夢時代 Dream Mall",
    lat: 22.597700, lng: 120.300700, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅／黃／藍色禮物貼紙飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "夢時代 Nintendo 授權商品店場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "台灣 Nintendo 授權商品店新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/june25-taiwan", lastVerifiedAt: verified2,
  },
  {
    id: "tw-hanshin-arena", country: "台灣", city: "高雄", name: "漢神巨蛋購物廣場",
    lat: 22.665600, lng: 120.301000, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅／黃／藍色禮物貼紙飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每 30 天最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "漢神巨蛋 Nintendo 授權商品店場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "台灣 Nintendo 授權商品店新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/june25-taiwan", lastVerifiedAt: verified2,
  },

  // ---- 香港（永久 Special Spot） ----
  {
    id: "hk-nsew-kmusea", country: "香港", city: "尖沙咀", name: "nsew — K11 MUSEA",
    lat: 22.293800, lng: 114.173500, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每日最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "K11 MUSEA B2/F Shop B211 場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "香港新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/dec25-hkspecialspots", lastVerifiedAt: verified2,
  },
  {
    id: "hk-nsew-kaitak", country: "香港", city: "九龍城", name: "nsew — 啟德體育園",
    lat: 22.328000, lng: 114.201000, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每日最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "啟德體育園 Kai Tak Mall 2 場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "香港新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/dec25-hkspecialspots", lastVerifiedAt: verified2,
  },
  {
    id: "hk-nsew-thewai", country: "香港", city: "大圍", name: "nsew — The Wai",
    lat: 22.375700, lng: 114.179900, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每日最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "The Wai 3/F Shop 314 場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "香港新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/dec25-hkspecialspots", lastVerifiedAt: verified2,
  },
  {
    id: "hk-assemble-hopewell", country: "香港", city: "灣仔", name: "Assemble — Hopewell Mall",
    lat: 22.277500, lng: 114.174500, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每日最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "Hopewell Mall 4/F Shop 414-415 場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "香港新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/dec25-hkspecialspots", lastVerifiedAt: verified2,
  },
  {
    id: "hk-lbuy-moko", country: "香港", city: "旺角", name: "LBuy — MOKO 新世紀廣場",
    lat: 22.322600, lng: 114.169100, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每日最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "MOKO 4/F Shop 426 場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "香港新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/dec25-hkspecialspots", lastVerifiedAt: verified2,
  },
  {
    id: "hk-nsew-hsr", country: "香港", city: "九龍", name: "nsew — 香港西九龍高鐵站",
    lat: 22.303700, lng: 114.162200, spotKind: "permanent", rewardKind: "gold_seedling",
    rewardSummary: "紅色照片鈕扣徽章飾品皮克敏金色花苗", startAt: 0, endAt: 0,
    cooldownNote: "每日最多 1 次", eligibilityNote: "需在 Special Spot 附近，並以遊戲顯示為準",
    coordinateNote: "西九龍站 nsew 場館座標；請以遊戲地圖確認", verificationStatus: "official",
    sourceTitle: "香港新增 Special Spot 官方公告", sourceUrl: "https://pikminbloom.com/en/news/dec25-hkspecialspots", lastVerifiedAt: verified2,
  },
];
