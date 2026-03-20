import { Play, Wifi, WifiOff, Tv } from "lucide-react";
import type { ChannelWithStream } from "../types/channel";
import { getCountryName } from "../services/api";

interface ChannelCardProps {
  channel: ChannelWithStream;
  onPlay: (channel: ChannelWithStream) => void;
}

function getInitials(name: string): string {
  return name
    .split(/[\s-]+/)
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ChannelCard({ channel, onPlay }: ChannelCardProps) {
  const hasStream = !!channel.stream;

  return (
    <div
      className={`group relative bg-gray-800 rounded-xl overflow-hidden border transition-all duration-300 ${
        hasStream
          ? "border-gray-700 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer"
          : "border-gray-800 opacity-60"
      }`}
      onClick={() => hasStream && onPlay(channel)}
    >
      {/* Channel Logo Area */}
      <div className="relative aspect-video bg-gray-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <Tv className="w-10 h-10 text-gray-600" />
          <span className="text-gray-400 font-bold text-lg tracking-wider">
            {getInitials(channel.name)}
          </span>
        </div>

        {/* Play overlay */}
        {hasStream && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
              <Play className="w-7 h-7 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {hasStream ? (
            <span className="flex items-center gap-1 bg-green-600/90 text-white text-xs font-medium px-2 py-1 rounded-full">
              <Wifi className="w-3 h-3" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-gray-600/90 text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          )}
        </div>

        {/* Country label */}
        <div className="absolute top-2 left-2">
          <span className="bg-gray-900/80 text-gray-300 text-xs px-2 py-1 rounded-full">
            {getCountryName(channel.country)}
          </span>
        </div>
      </div>

      {/* Channel Info */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate" title={channel.name}>
          {channel.name}
        </h3>
        {channel.network && (
          <p className="text-gray-400 text-xs mt-1 truncate">{channel.network}</p>
        )}
        {channel.stream?.quality && (
          <span className="inline-block mt-2 bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded">
            {channel.stream.quality}
          </span>
        )}
      </div>
    </div>
  );
}
