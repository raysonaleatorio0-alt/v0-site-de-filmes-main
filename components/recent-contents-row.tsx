"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CustomContent, getRecentContents } from "@/lib/content-store";
import { ContentCard } from "@/components/content-card";

export function RecentContentsRow() {
  const [contents, setContents] = useState<CustomContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const recent = getRecentContents(10);
    setContents(recent);
    setIsLoading(false);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (isLoading || contents.length === 0) return null;

  // Converter CustomContent para TMDBMovie format
  const items = contents.map((content) => ({
    id: content.tmdbId,
    title: content.title,
    name: content.title,
    overview: content.overview,
    poster_path: content.posterPath,
    backdrop_path: content.backdropPath,
    vote_average: content.voteAverage,
    release_date: content.releaseDate,
    first_air_date: content.releaseDate,
    genre_ids: [],
    media_type: content.type as "movie" | "tv",
  }));

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            Recém Cadastrados
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Rolar para direita"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
        >
          {items.map((item) => (
            <ContentCard key={item.id} item={item} size="medium" />
          ))}
        </div>
      </div>
    </section>
  );
}

