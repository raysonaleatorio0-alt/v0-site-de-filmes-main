"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { TMDBMovie, getImageUrl } from "@/lib/tmdb";
import { FavoriteButton } from "@/components/favorite-button";

interface ContentCardProps {
  item: TMDBMovie;
  size?: "small" | "medium" | "large";
}

export function ContentCard({ item, size = "medium" }: ContentCardProps) {
  const title = item.title || item.name || "Sem título";
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const posterUrl = getImageUrl(item.poster_path, "w500");
  const year = (item.release_date || item.first_air_date)?.split("-")[0] || "";

  const sizeClasses = {
    small: "w-32 md:w-40",
    medium: "w-40 md:w-48",
    large: "w-48 md:w-56",
  };

  return (
    <Link
      href={`/${mediaType}/${item.id}`}
      className={`group flex-shrink-0 ${sizeClasses[size]}`}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card">
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 160px, 192px"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <FavoriteButton contentId={item.id} contentType={mediaType as "movie" | "tv"} />
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/80 text-xs">
          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          <span className="font-medium">{item.vote_average.toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{year}</p>
      </div>
    </Link>
  );
}
