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
];
