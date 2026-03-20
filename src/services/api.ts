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

function getQualityScore(quality: string | null): number {
  if (!quality) return 0;
  const match = quality.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function pickBestStream(existing: Stream | undefined, candidate: Stream): Stream {
  if (!existing) return candidate;
  const existingScore = getQualityScore(existing.quality);
  const candidateScore = getQualityScore(candidate.quality);
  if (candidateScore > existingScore) return candidate;
  if (existing.feed !== "HD" && candidate.feed === "HD") return candidate;
  return existing;
}

export async function fetchSportsChannels(): Promise<ChannelWithStream[]> {
  const [channels, streams] = await Promise.all([
    fetchChannels(),
    fetchStreams(),
  ]);

  // Build a map of channel ID -> best available stream, preferring HD / highest quality
  const streamMap = new Map<string, Stream>();
  for (const stream of streams) {
    const current = streamMap.get(stream.channel);
    streamMap.set(stream.channel, pickBestStream(current, stream));
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

  // Sort: Star Sports network first, then live channels, then Indian channels, then alphabetical
  channelsWithStreams.sort((a, b) => {
    const aIsStarSports = a.network === "Star Sports" ? 1 : 0;
    const bIsStarSports = b.network === "Star Sports" ? 1 : 0;
    if (aIsStarSports !== bIsStarSports) return bIsStarSports - aIsStarSports;
    if (a.stream && !b.stream) return -1;
    if (!a.stream && b.stream) return 1;
    if (a.country === "IN" && b.country !== "IN") return -1;
    if (a.country !== "IN" && b.country === "IN") return 1;
    return a.name.localeCompare(b.name);
  });

  return channelsWithStreams;
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
