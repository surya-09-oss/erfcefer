export interface Channel {
  id: string;
  name: string;
  alt_names: string[];
  network: string | null;
  owners: string[];
  country: string;
  categories: string[];
  is_nsfw: boolean;
  launched: string | null;
  closed: string | null;
  replaced_by: string | null;
  website: string | null;
}

export interface Stream {
  channel: string | null;
  feed: string | null;
  title: string;
  url: string;
  quality: string | null;
  user_agent: string | null;
  referrer: string | null;
}

export interface ChannelWithStream extends Channel {
  stream: Stream | null;
}

export type FilterCountry = "all" | "IN" | "US" | "GB" | "AE" | "AU" | "OTHER";
