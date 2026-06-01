"use client";

import { useEffect, useState } from "react";
import { PlayerSelector } from "@/components/player-selector";
import { getContentByTmdbId } from "@/lib/content-store";

interface MoviePlayerProps {
  movieId: number;
  movieTitle: string;
  trailer?: {
    key: string;
    site: string;
    type: string;
  };
}

export function MoviePlayer({ movieId, movieTitle, trailer }: MoviePlayerProps) {
  const [primaryUrl, setPrimaryUrl] = useState<string | undefined>();

  useEffect(() => {
    const content = getContentByTmdbId(movieId, "movie");
    setPrimaryUrl(content?.embedUrl);
  }, [movieId]);

  return (
    <PlayerSelector
      contentId={movieId}
      contentTitle={movieTitle}
      contentType="movie"
      primaryUrl={primaryUrl}
      trailer={trailer}
    />
  );
}
