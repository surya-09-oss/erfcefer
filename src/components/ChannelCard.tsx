import { Play, Wifi, WifiOff } from "lucide-react";
import type { ChannelWithStream } from "../types/channel";
import { getCountryName } from "../services/api";

interface ChannelCardProps {
  channel: ChannelWithStream;
  onPlay: (channel: ChannelWithStream) => void;
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
      {/* Channel Logo */}
      <div className="relative aspect-video bg-gray-900 flex items-center justify-center p-6">
        <img
          src={channel.logo}
          alt={channel.name}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%231f2937'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%236b7280' font-size='14' font-family='sans-serif'%3ENo Logo%3C/text%3E%3C/svg%3E";
          }}
        />

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

        {/* Country flag */}
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
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {channel.languages.slice(0, 2).map((lang) => (
            <span key={lang} className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded">
              {lang}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
