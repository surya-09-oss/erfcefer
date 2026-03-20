export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  quality: string | null;
  country: string;
  userAgent: string | null;
  referrer: string | null;
}

export type FilterCountry = "all" | "IN" | "US" | "GB" | "AE" | "AU" | "OTHER";
