"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Episode, getEpisodes } from "@/lib/content-store";
import { getTVSeasonDetails } from "@/lib/tmdb";

interface EpisodeSelectorProps {
  contentId?: string;
  tmdbId: number;
  type: "tv";
  onEpisodeSelect: (season: number, episode: number, url?: string) => void;
  totalSeasons?: number;
  currentSeason: number;
  currentEpisode: number;
}

export function EpisodeSelector({
  contentId,
  tmdbId,
  onEpisodeSelect,
  totalSeasons = 1,
  currentSeason,
  currentEpisode,
}: EpisodeSelectorProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [seasonEpisodeCount, setSeasonEpisodeCount] = useState<Record<number, number>>({});
  const [showSeasonMenu, setShowSeasonMenu] = useState(false);
  const [showEpisodeMenu, setShowEpisodeMenu] = useState(false);
  const [loadedSeasons, setLoadedSeasons] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (contentId) {
      const eps = getEpisodes(contentId);
      setEpisodes(eps);
    }
  }, [contentId]);

  // Carregar episódios da temporada do TMDB
  useEffect(() => {
    if (loadedSeasons.has(currentSeason)) return;

    const loadSeasonEpisodes = async () => {
      try {
        const seasonData = await getTVSeasonDetails(tmdbId, currentSeason);
        if (seasonData?.episodes) {
          setSeasonEpisodeCount((prev) => ({
            ...prev,
            [currentSeason]: seasonData.episodes.length,
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar episódios da temporada:", error);
        setSeasonEpisodeCount((prev) => ({
          ...prev,
          [currentSeason]: 10,
        }));
      }
      setLoadedSeasons((prev) => new Set([...prev, currentSeason]));
    };

    loadSeasonEpisodes();
  }, [tmdbId, currentSeason, loadedSeasons]);

  const seasons = Array.from({ length: totalSeasons }, (_, i) => i + 1);
  
  // Episódios cadastrados da temporada atual
  const episodesInSeason = episodes.filter((e) => e.season === currentSeason).map((e) => e.episode);
  
  // Total de episódios no TMDB para a temporada
  const totalEpisodesInSeason = seasonEpisodeCount[currentSeason] || 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setShowSeasonMenu(!showSeasonMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
        >
          Temporada {currentSeason}
          <ChevronDown className="h-4 w-4" />
        </button>

        {showSeasonMenu && (
          <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {Array.from({ length: Math.max(totalSeasons, Math.max(...episodes.map((e) => e.season), 1)) }).map(
              (_, i) => {
                const season = i + 1;
                return (
                  <button
                    key={season}
                    onClick={() => {
                      onEpisodeSelect(season, 1);
                      setShowSeasonMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-secondary transition-colors ${
                      currentSeason === season ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    Temporada {season}
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>

      {totalEpisodesInSeason > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowEpisodeMenu(!showEpisodeMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            Episódio {currentEpisode}
            <ChevronDown className="h-4 w-4" />
          </button>

          {showEpisodeMenu && (
            <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {Array.from({ length: totalEpisodesInSeason }).map((_, i) => {
                const episode = i + 1;
                const hasCadastroed = episodesInSeason.includes(episode);
                
                return (
                  <button
                    key={episode}
                    onClick={() => {
                      onEpisodeSelect(currentSeason, episode);
                      setShowEpisodeMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-secondary transition-colors flex items-center justify-between ${
                      currentEpisode === episode ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    <span>Episódio {episode}</span>
                    {hasCadastroed && (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
