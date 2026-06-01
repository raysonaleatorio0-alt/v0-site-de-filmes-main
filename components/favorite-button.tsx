"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuth } from "@/hooks/use-auth";

interface FavoriteButtonProps {
  contentId: string | number;
  contentType?: "movie" | "tv";
  className?: string;
  showText?: boolean;
}

export function FavoriteButton({ 
  contentId, 
  contentType = "movie",
  className = "", 
  showText = false 
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorite(contentId);

  const handleClick = async () => {
    if (!user) {
      alert("Faça login para adicionar favoritos");
      return;
    }

    if (favorited) {
      await removeFavorite(contentId);
    } else {
      await addFavorite(contentId, contentType);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleClick();
  };

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      size="sm"
      onClick={handleButtonClick}
      className={`gap-2 ${className}`}
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
      {showText && (favorited ? "Remover" : "Favoritar")}
    </Button>
  );
}
