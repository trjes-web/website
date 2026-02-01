import { useState } from "react";

interface MediaPlayerProps {
  src: string;
  type: "audio" | "video";
  poster?: string;
  className?: string;
}

export function MediaPlayer({ src, type, poster, className = "" }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 font-mono text-xs text-gray-400 ${className}`}>
        failed to load media
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className={`bg-gray-50 p-4 ${className}`}>
        <audio
          src={src}
          controls
          className="w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setError(true)}
          data-testid="audio-player"
        />
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${className}`}>
      <video
        src={src}
        controls
        poster={poster}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setError(true)}
        data-testid="video-player"
      />
    </div>
  );
}
