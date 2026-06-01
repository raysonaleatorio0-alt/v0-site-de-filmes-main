"use client";

import { useEffect, useState } from "react";
import { PlayerSelector } from "@/components/player-selector";
import { getContentByTmdbId } from "@/lib/content-store";

interface TVPlayerProps {
  showId: number;
  showTitle: string;
  trailer?: {
    key: string;
    site: string;
    type: string;
  };
  episodeUrl?: string;
  currentSeason?: number;
  currentEpisode?: number;
}

export function TVPlayer({
  showId,
  showTitle,
  trailer,
  episodeUrl,
  currentSeason = 1,
  currentEpisode = 1,
}: TVPlayerProps) {
  const [primaryUrl, setPrimaryUrl] = useState<string | undefined>();

  useEffect(() => {
    if (episodeUrl) {
      setPrimaryUrl(episodeUrl);
    } else {
      const content = getContentByTmdbId(showId, "tv");
      setPrimaryUrl(content?.embedUrl);
    }
  }, [showId, episodeUrl]);

  const playerTitle =
    currentSeason && currentEpisode
      ? `${showTitle} - T${currentSeason}E${currentEpisode}`
      : showTitle;

  return (
    <PlayerSelector
      contentId={showId}
      contentTitle={playerTitle}
      contentType="tv"
      seasonNumber={currentSeason}
      episodeNumber={currentEpisode}
      primaryUrl={primaryUrl}
      trailer={trailer}
    />
  );
}
