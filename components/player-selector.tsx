"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerModal } from "@/components/player-modal";

interface PlayerSelectorProps {
  contentId: number;
  contentTitle: string;
  contentType: "movie" | "tv"; // filme ou série
  seasonNumber?: number;
  episodeNumber?: number;
  primaryUrl?: string; // URL do embedUrl cadastrado
  trailer?: {
    key: string;
    site: string;
    type: string;
  };
}

export function PlayerSelector({
  contentId,
  contentTitle,
  contentType,
  seasonNumber,
  episodeNumber,
  primaryUrl,
  trailer,
}: PlayerSelectorProps) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<"primary" | "megaembed" | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | undefined>();

  const handlePlayerSelect = (playerType: "primary" | "megaembed") => {
    setSelectedPlayer(playerType);

    if (playerType === "primary") {
      // Usar URL cadastrada no painel moderador
      setPlayerUrl(primaryUrl);
    } else if (playerType === "megaembed") {
      // Gerar URL do MegaEmbed
      if (contentType === "movie") {
        setPlayerUrl(`https://mgeb.top/embed/${contentId}`);
      } else if (contentType === "tv") {
        const season = seasonNumber ?? 1;
        const episode = episodeNumber ?? 1;
        setPlayerUrl(`https://mgeb.top/embed/${contentId}/${season}/${episode}`);
      }
    }

    setIsPlayerOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {trailer && (
          <a
            href={`https://www.youtube.com/watch?v=${trailer.key}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="gap-2" variant="outline">
              <Play className="h-5 w-5 fill-current" />
              Assistir Trailer
            </Button>
          </a>
        )}

        {/* Botão Assistir com dropdown de opções */}
        <div className="relative group">
          <Button size="lg" className="gap-2">
            <Play className="h-5 w-5 fill-current" />
            Assistir
          </Button>

          {/* Menu de opções */}
          <div className="absolute left-0 top-full mt-2 bg-secondary border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-10">
            <button
              onClick={() => handlePlayerSelect("megaembed")}
              className="w-full px-4 py-2 text-left hover:bg-secondary/80 transition-colors text-sm first:rounded-t-md flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-primary rounded-full" />
              MegaEmbed
            </button>
            {primaryUrl && (
              <button
                onClick={() => handlePlayerSelect("primary")}
                className="w-full px-4 py-2 text-left hover:bg-secondary/80 transition-colors text-sm last:rounded-b-md border-t border-border/50 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-primary rounded-full" />
                Principal
              </button>
            )}
          </div>
        </div>
      </div>

      <PlayerModal
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setSelectedPlayer(null);
          setPlayerUrl(undefined);
        }}
        embedUrl={playerUrl}
        title={contentTitle}
      />
    </>
  );
}
