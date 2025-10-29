const LanguageNameMap = {
  en: "英文",
  zh: "中文",
  jp: "日语",
  kor: "韩语",
  fra: "法语",
  de: "德语",
  ru: "俄语",
  th: "泰语",
  spa: "西班牙语",
  ara: "阿拉伯语",
  it: "意大利语",
  pt: "葡萄牙语"
} as const;

type LanguageEnum = keyof typeof LanguageNameMap;

type LanguagePair = {
  [K in LanguageEnum]: {
    lang: K;
    chs: (typeof LanguageNameMap)[K];
    index: number;
  };
}[LanguageEnum]; // 提取成联合类型

const languageList: LanguagePair[] = [
  { chs: "英文", lang: "en", index: 0 },
  { chs: "中文", lang: "zh", index: 1 },
  { chs: "日语", lang: "jp", index: 2 },
  { chs: "韩语", lang: "kor", index: 3 },
  { chs: "法语", lang: "fra", index: 4 },
  { chs: "德语", lang: "de", index: 5 },
  { chs: "俄语", lang: "ru", index: 6 },
  { chs: "泰语", lang: "th", index: 7 },
  { chs: "西班牙语", lang: "spa", index: 8 },
  { chs: "阿拉伯语", lang: "ara", index: 9 },
  { chs: "意大利语", lang: "it", index: 10 },
  { chs: "葡萄牙语", lang: "pt", index: 11 }
];

export interface IHistoryItem {
  txt: string;
  res: string;
}

const history: IHistoryItem[] = [];

export default {
  languageList,
  currentIndex: 0,
  history
};
