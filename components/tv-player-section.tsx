"use client";

import { useState, useEffect } from "react";
import { TVPlayer } from "@/components/tv-player";
import { EpisodeSelector } from "@/components/episode-selector";
import { getContentByTmdbId, getEpisodeUrl } from "@/lib/content-store";

interface TVPlayerSectionProps {
  showId: number;
  showTitle: string;
  trailer?: {
    key: string;
    site: string;
    type: string;
  };
  numberOfSeasons?: number;
}

export function TVPlayerSection({
  showId,
  showTitle,
  trailer,
  numberOfSeasons = 1,
}: TVPlayerSectionProps) {
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [contentId, setContentId] = useState<string | null>(null);
  const [episodeUrl, setEpisodeUrl] = useState<string | undefined>();

  useEffect(() => {
    const content = getContentByTmdbId(showId, "tv");
    if (content) {
      setContentId(content.id);
      const url = getEpisodeUrl(content.id, currentSeason, currentEpisode);
      setEpisodeUrl(url);
    }
  }, [showId, currentSeason, currentEpisode]);

  const handleEpisodeSelect = (season: number, episode: number) => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
  };

  return (
    <div className="space-y-4">
      <TVPlayer
        showId={showId}
        showTitle={showTitle}
        trailer={trailer}
        episodeUrl={episodeUrl}
        currentSeason={currentSeason}
        currentEpisode={currentEpisode}
      />

      <EpisodeSelector
        contentId={contentId || undefined}
        tmdbId={showId}
        type="tv"
        onEpisodeSelect={handleEpisodeSelect}
        totalSeasons={numberOfSeasons}
        currentSeason={currentSeason}
        currentEpisode={currentEpisode}
      />
    </div>
  );
}
