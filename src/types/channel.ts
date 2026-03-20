export interface Channel {
  id: string;
  name: string;
  alt_names: string[];
  network: string | null;
  owners: string[];
  country: string;
  subdivision: string | null;
  city: string | null;
  broadcast_area: string[];
  languages: string[];
  categories: string[];
  is_nsfw: boolean;
  launched: string | null;
  closed: string | null;
  replaced_by: string | null;
  website: string | null;
  logo: string;
}

export interface Stream {
  channel: string;
  url: string;
  http_referrer: string | null;
  user_agent: string | null;
  status: string;
  width: number;
  height: number;
}

export interface ChannelWithStream extends Channel {
  stream: Stream | null;
}

export interface Category {
  id: string;
  name: string;
}

export type FilterCountry = "all" | "IN" | "US" | "GB" | "AE" | "AU" | "OTHER";
