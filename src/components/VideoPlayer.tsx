import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Volume2, VolumeX, Maximize, Minimize, Play, Pause, Loader2 } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  channelName: string;
  channelLogo: string;
  onClose: () => void;
}

export default function VideoPlayer({ url, channelName, channelLogo, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error - stream may be unavailable. Try another channel.");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError("Stream playback failed. Try another channel.");
              hls.destroy();
              break;
          }
          setIsLoading(false);
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
      video.addEventListener("error", () => {
        setError("Failed to load stream");
        setIsLoading(false);
      });
    } else {
      setError("Your browser does not support HLS streaming");
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          onClick={togglePlay}
          playsInline
        />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-3" />
            <p className="text-white text-sm">Loading stream...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-red-400 text-center px-6">
              <p className="text-lg font-semibold mb-2">Stream Error</p>
              <p className="text-sm text-gray-300">{error}</p>
            </div>
          </div>
        )}

        {showControls && (
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {/* Top bar */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
              <div className="flex items-center gap-3">
                <img
                  src={channelLogo}
                  alt={channelName}
                  className="w-8 h-8 rounded object-contain bg-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23374151'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%239CA3AF' font-size='16'%3ETV%3C/text%3E%3C/svg%3E";
                  }}
                />
                <h3 className="text-white font-semibold text-lg truncate max-w-md">{channelName}</h3>
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
                  LIVE
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-red-400 transition-colors text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
              >
                &times;
              </button>
            </div>

            {/* Center play/pause */}
            {!isLoading && !error && (
              <div className="flex items-center justify-center pointer-events-auto">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>
            )}

            {/* Bottom controls */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white hover:text-green-400 transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={toggleMute} className="text-white hover:text-green-400 transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={toggleFullscreen} className="text-white hover:text-green-400 transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
