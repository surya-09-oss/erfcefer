import type { Channel } from "../types/channel";

const SPORTS_PLAYLIST_URL =
  "https://iptv-org.github.io/iptv/categories/sports.m3u";

function extractCountryFromId(id: string): string {
  const match = id.match(/\.([a-z]{2})@/i);
  return match ? match[1].toUpperCase() : "";
}

function parseQuality(name: string): string | null {
  const match = name.match(/\((\d+p)\)/);
  return match ? match[1] : null;
}

function parseM3U(text: string): Channel[] {
  const lines = text.split("\n");
  const channels: Channel[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("#EXTINF:")) continue;

    // Find the stream URL (next non-comment, non-empty line)
    let url = "";
    let userAgent: string | null = null;
    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j].trim();
      if (!nextLine || nextLine.startsWith("#EXTINF:")) break;
      if (nextLine.startsWith("#EXTVLCOPT:http-user-agent=")) {
        userAgent = nextLine.replace("#EXTVLCOPT:http-user-agent=", "");
        continue;
      }
      if (!nextLine.startsWith("#")) {
        url = nextLine;
        break;
      }
    }
    if (!url) continue;

    const idMatch = line.match(/tvg-id="([^"]*)"/);
    const logoMatch = line.match(/tvg-logo="([^"]*)"/);
    const groupMatch = line.match(/group-title="([^"]*)"/);
    const uaMatch = line.match(/http-user-agent="([^"]*)"/);

    // Channel name is everything after the last comma in the EXTINF line
    const commaIdx = line.indexOf(",");
    const name = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : "";
    if (!name) continue;

    const id = idMatch ? idMatch[1] : name;
    const logo = logoMatch ? logoMatch[1] : "";
    const group = groupMatch ? groupMatch[1] : "Sports";
    const country = extractCountryFromId(id);
    const quality = parseQuality(name);
    const agentFromLine = uaMatch ? uaMatch[1] : null;

    channels.push({
      id,
      name,
      logo,
      group,
      url,
      quality,
      country,
      userAgent: userAgent || agentFromLine,
      referrer: null,
    });
  }

  return channels;
}

export async function fetchSportsChannels(): Promise<Channel[]> {
  const response = await fetch(SPORTS_PLAYLIST_URL);
  if (!response.ok) throw new Error("Failed to fetch sports playlist");
  const text = await response.text();
  const channels = parseM3U(text);

  // Sort: Star Sports first, then Indian channels, then alphabetical
  channels.sort((a, b) => {
    const aIsStarSports = a.name.toLowerCase().includes("star sports") ? 1 : 0;
    const bIsStarSports = b.name.toLowerCase().includes("star sports") ? 1 : 0;
    if (aIsStarSports !== bIsStarSports) return bIsStarSports - aIsStarSports;
    if (a.country === "IN" && b.country !== "IN") return -1;
    if (a.country !== "IN" && b.country === "IN") return 1;
    return a.name.localeCompare(b.name);
  });

  return channels;
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
