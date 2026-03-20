import { useState, useEffect, useMemo } from "react";
import { Loader2, AlertCircle, Radio } from "lucide-react";
import { fetchSportsChannels } from "./services/api";
import type { ChannelWithStream, FilterCountry } from "./types/channel";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import ChannelCard from "./components/ChannelCard";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  const [channels, setChannels] = useState<ChannelWithStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<FilterCountry>("all");
  const [showOnlyLive, setShowOnlyLive] = useState(true);
  const [activeChannel, setActiveChannel] = useState<ChannelWithStream | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSportsChannels();
      setChannels(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load channels"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredChannels = useMemo(() => {
    let filtered = channels;

    if (showOnlyLive) {
      filtered = filtered.filter((ch) => ch.stream !== null);
    }

    if (selectedCountry !== "all") {
      if (selectedCountry === "OTHER") {
        const mainCountries = ["IN", "US", "GB", "AE", "AU"];
        filtered = filtered.filter(
          (ch) => !mainCountries.includes(ch.country)
        );
      } else {
        filtered = filtered.filter((ch) => ch.country === selectedCountry);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ch) =>
          ch.name.toLowerCase().includes(query) ||
          (ch.network && ch.network.toLowerCase().includes(query)) ||
          ch.country.toLowerCase().includes(query) ||
          ch.alt_names.some((n) => n.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [channels, searchQuery, selectedCountry, showOnlyLive]);

  const liveChannels = useMemo(
    () => channels.filter((ch) => ch.stream !== null).length,
    [channels]
  );

  const handlePlayChannel = (channel: ChannelWithStream) => {
    if (channel.stream) {
      setActiveChannel(channel);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <Radio className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
        <p className="text-gray-400 text-lg">Loading sports channels...</p>
        <p className="text-gray-600 text-sm mt-2">
          Fetching channels from around the world
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-400 text-lg font-semibold mb-2">
          Failed to Load Channels
        </p>
        <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
          {error}
        </p>
        <button
          onClick={loadChannels}
          className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalChannels={channels.length}
        liveChannels={liveChannels}
      />

      <FilterBar
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        showOnlyLive={showOnlyLive}
        onToggleLive={() => setShowOnlyLive(!showOnlyLive)}
      />

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Radio className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg font-semibold">
              No channels found
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">
              Showing {filteredChannels.length} channel
              {filteredChannels.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onPlay={handlePlayChannel}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            SportsStream - Free live sports channels from around the world
          </p>
          <p className="text-gray-700 text-xs mt-1">
            Powered by open-source IPTV community data
          </p>
        </div>
      </footer>

      {activeChannel && activeChannel.stream && (
        <VideoPlayer
          url={activeChannel.stream.url}
          channelName={activeChannel.name}
          channelLogo={activeChannel.logo}
          onClose={() => setActiveChannel(null)}
        />
      )}
    </div>
  );
}

export default App;
