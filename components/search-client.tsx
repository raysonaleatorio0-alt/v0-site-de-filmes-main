"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ContentCard } from "./content-card";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import type { TMDBMovie, TMDBResponse } from "@/lib/tmdb";

export function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  // Busca inicial se tiver query na URL
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/tmdb/search?q=${encodeURIComponent(searchTerm)}`
      );
      const data: TMDBResponse = await response.json();
      
      setResults(
        data.results.filter(
          (item) => item.media_type !== "person"
        )
      );
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Pesquise filmes, séries, atores..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 text-base"
        />
      </div>

      {!query ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            Digite algo para pesquisar filmes e séries
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      ) : results.length > 0 ? (
        <div>
          <p className="text-muted-foreground mb-6">
            {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado
            {results.length !== 1 ? "s" : ""} para: <span className="text-foreground font-medium">&quot;{query}&quot;</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            Nenhum resultado encontrado para &quot;{query}&quot;
          </p>
        </div>
      ) : null}
    </div>
  );
}
