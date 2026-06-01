"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TMDBMovie, getImageUrl } from "@/lib/tmdb";

interface HeroBannerProps {
  items: TMDBMovie[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [items.length]);

  const item = items[currentIndex];
  const title = item.title || item.name || "Sem título";
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const backdropUrl = getImageUrl(item.backdrop_path, "original");

  return (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl pt-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance">
            {title}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-yellow-500" />
              <span className="font-semibold">{item.vote_average.toFixed(1)}</span>
            </div>
            <span className="px-2 py-0.5 text-xs font-medium bg-secondary rounded">
              {mediaType === "movie" ? "FILME" : "SÉRIE"}
            </span>
          </div>

          <p className="text-muted-foreground text-sm md:text-base mb-6 line-clamp-3">
            {item.overview || "Sem descrição disponível."}
          </p>

          <div className="flex items-center gap-3">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5 fill-current" />
              Assistir
            </Button>
            <Link href={`/${mediaType}/${item.id}`}>
              <Button variant="secondary" size="lg" className="gap-2">
                <Info className="h-5 w-5" />
                Detalhes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {items.slice(0, 5).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-8" : "bg-white/50 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
