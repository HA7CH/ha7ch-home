export interface Article {
  slug: string;
  titleZh: string;
  titleEn: string;
  date: string;
  dateDisplay: string;
  zh: string[];
  en: string[];
  description?: string;
  descriptionZh?: string;
  keywords?: string[];
}
