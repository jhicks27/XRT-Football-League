"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { getYoutubeVideoId, getYoutubeThumbnail, getYoutubeEmbedUrl } from "@/lib/youtube";

interface YoutubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export default function YoutubeEmbed({ url, title, className = "" }: YoutubeEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    return <div className="text-sm text-gray-500">Invalid YouTube URL</div>;
  }

  if (!playing) {
    return (
      <div
        className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer group ${className}`}
        onClick={() => setPlaying(true)}
      >
        <img
          src={getYoutubeThumbnail(videoId)}
          alt={title || "Video thumbnail"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-sm font-semibold truncate">{title}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`aspect-video rounded-xl overflow-hidden ${className}`}>
      <iframe
        src={`${getYoutubeEmbedUrl(videoId)}?autoplay=1`}
        title={title || "YouTube video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
