import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import React from "react";

export interface Episode {
  id: string;
  title: string;
  description: string;
  episodeNumber: number;
  duration: string;
  thumbnailUrl: string;
  seriesTitle?: string;
  seriesId?: string;
}

interface EpisodeCardProps {
  episode: Episode;
  variant?: "vertical" | "horizontal";
  className?: string;
  style?: React.CSSProperties;
}

export function EpisodeCard({
  episode,
  variant = "vertical",
  className,
  style,
}: EpisodeCardProps) {
  if (variant === "horizontal") {
    return (
      <Link
        to={`/watch/${episode.id}`}
        className={cn(
          "flex gap-4 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors group",
          className
        )}
        style={style}
      >
        <div className="relative w-24 aspect-[9/16] rounded-lg overflow-hidden bg-secondary flex-shrink-0">
          {episode.thumbnailUrl ? (
            <img
              src={episode.thumbnailUrl}
              alt={episode.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-secondary flex items-center justify-center">
              <Play className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
            <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-4 h-4 text-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>
          {episode.duration && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm">
              <span className="text-[10px] font-medium">{episode.duration}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-caption text-muted-foreground mb-1">
            Episode {episode.episodeNumber}
          </span>
          <h4 className="text-title text-sm mb-1 truncate">{episode.title}</h4>
          {episode.description && (
            <p className="text-body text-muted-foreground line-clamp-2 text-xs">
              {episode.description}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/watch/${episode.id}`}
      className={cn("block group animate-fade-in", className)}
      style={style}
    >
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-card">
        {/* Background image */}
        {episode.thumbnailUrl ? (
          <img
            src={episode.thumbnailUrl}
            alt={episode.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
            <Play className="w-10 h-10 text-muted-foreground" />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 gradient-overlay" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="space-y-2">
            {episode.seriesTitle && (
              <span className="text-caption text-gold">{episode.seriesTitle}</span>
            )}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-foreground/10 backdrop-blur-sm text-[10px] font-medium">
                Episode {episode.episodeNumber}
              </span>
              {episode.duration && (
                <span className="text-xs text-muted-foreground">
                  {episode.duration}
                </span>
              )}
            </div>
            {episode.description && (
              <p className="text-body text-foreground/80 line-clamp-2">
                {episode.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
