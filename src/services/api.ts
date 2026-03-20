import type { Channel, Stream, ChannelWithStream } from "../types/channel";

const API_BASE = "https://iptv-org.github.io/api";

export async function fetchChannels(): Promise<Channel[]> {
  const response = await fetch(`${API_BASE}/channels.json`);
  if (!response.ok) throw new Error("Failed to fetch channels");
  return response.json();
}

export async function fetchStreams(): Promise<Stream[]> {
  const response = await fetch(`${API_BASE}/streams.json`);
  if (!response.ok) throw new Error("Failed to fetch streams");
  return response.json();
}

export async function fetchSportsChannels(): Promise<ChannelWithStream[]> {
  const [channels, streams] = await Promise.all([
    fetchChannels(),
    fetchStreams(),
  ]);

  // Build a map of channel ID -> stream (all streams are valid, no status filtering needed)
  const streamMap = new Map<string, Stream>();
  for (const stream of streams) {
    if (stream.channel && !streamMap.has(stream.channel)) {
      streamMap.set(stream.channel, stream);
    }
  }

  const sportsChannels = channels.filter(
    (ch) =>
      ch.categories.includes("sports") &&
      !ch.is_nsfw &&
      ch.closed === null
  );

  const channelsWithStreams: ChannelWithStream[] = sportsChannels.map((ch) => ({
    ...ch,
    stream: streamMap.get(ch.id) || null,
  }));

  channelsWithStreams.sort((a, b) => {
    if (a.stream && !b.stream) return -1;
    if (!a.stream && b.stream) return 1;
    if (a.country === "IN" && b.country !== "IN") return -1;
    if (a.country !== "IN" && b.country === "IN") return 1;
    return a.name.localeCompare(b.name);
  });

  return channelsWithStreams;
}

export function getChannelLogoUrl(channel: Channel): string {
  return `https://raw.githubusercontent.com/nicnocquee/logos/main/tv/${channel.id}.png`;
}

export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    IN: "India",
    US: "United States",
    GB: "United Kingdom",
    AE: "UAE",
    AU: "Australia",
    BR: "Brazil",
    CA: "Canada",
    DE: "Germany",
    ES: "Spain",
    FR: "France",
    IT: "Italy",
    JP: "Japan",
    KR: "South Korea",
    MX: "Mexico",
    PK: "Pakistan",
    SA: "Saudi Arabia",
    ZA: "South Africa",
    BD: "Bangladesh",
    LK: "Sri Lanka",
    NP: "Nepal",
  };
  return countries[code] || code;
}
