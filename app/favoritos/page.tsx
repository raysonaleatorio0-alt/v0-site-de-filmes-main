"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { ContentCard } from "@/components/content-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMovieDetails, getTVDetails, TMDBMovie } from "@/lib/tmdb";
import { Header } from "@/components/header";

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [contents, setContents] = useState<TMDBMovie[]>([]);
  const [contentsLoading, setContentsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading && !user) {
      router.push("/");
    }
  }, [user, loading, isMounted, router]);

  // Fetch content details for all favorites
  useEffect(() => {
    const loadFavoriteContents = async () => {
      if (favorites.size === 0) {
        setContents([]);
        return;
      }

      setContentsLoading(true);
      try {
        const contentPromises = Array.from(favorites.entries()).map(
          async ([contentId, favoriteItem]) => {
            try {
              let contentData;
              if (favoriteItem.type === "tv") {
                contentData = await getTVDetails(Number(contentId));
              } else {
                contentData = await getMovieDetails(Number(contentId));
              }
              return {
                ...contentData,
                media_type: favoriteItem.type,
              } as TMDBMovie;
            } catch (error) {
              console.error(`Erro ao carregar ${favoriteItem.type} ${contentId}:`, error);
              return null;
            }
          }
        );

        const results = await Promise.all(contentPromises);
        const validContents = results.filter((c) => c !== null) as TMDBMovie[];
        setContents(validContents);
      } catch (error) {
        console.error("Erro ao carregar conteúdos favoritos:", error);
      } finally {
        setContentsLoading(false);
      }
    };

    if (isMounted && !favoritesLoading) {
      loadFavoriteContents();
    }
  }, [favorites, favoritesLoading, isMounted]);

  if (loading || !isMounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Meus Favoritos</h1>
          <p className="text-muted-foreground">
            Você tem {favorites.size} conteúdo{favorites.size !== 1 ? "s" : ""} favorito{favorites.size !== 1 ? "s" : ""}
          </p>
        </div>

        {contentsLoading || favoritesLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando seus favoritos...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum conteúdo favorito ainda</p>
            <Link href="/">
              <Button>Voltar ao Início</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {contents.map((content) => (
              <ContentCard key={content.id} item={content} size="medium" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
