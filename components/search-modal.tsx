"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { ContentCard } from "./content-card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { TMDBMovie, TMDBResponse } from "@/lib/tmdb";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Buscar resultados
  const performSearch = async (searchTerm: string, page: number = 1) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setCurrentPage(1);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/tmdb/search?q=${encodeURIComponent(searchTerm)}&page=${page}`
      );
      const data: TMDBResponse = await response.json();
      
      // Filtrar apenas pessoas, mas incluir filmes e séries mesmo sem poster
      const filteredResults = data.results.filter(
        (item) => item.media_type !== "person"
      );

      if (page === 1) {
        setResults(filteredResults);
      } else {
        // Adicionar mais resultados à lista existente
        setResults((prev) => [...prev, ...filteredResults]);
      }
      
      setCurrentPage(page);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Search error:", error);
      if (page === 1) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search quando query muda
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      performSearch(query, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Carregar próxima página
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      performSearch(query, currentPage + 1);
    }
  };

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-4xl px-4 max-h-[80vh] flex flex-col">
        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pesquisar filmes e séries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-12 text-lg bg-card border-border"
            autoFocus
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto">
          {!query ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Digite algo para pesquisar filmes e séries
              </p>
            </div>
          ) : loading && results.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado
                {results.length !== 1 ? "s" : ""} (página {currentPage} de {totalPages})
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 pb-4">
                {results.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
              
              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="flex justify-center mt-6 pb-4">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      `Carregar mais (página ${currentPage + 1})`
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : query && !loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum resultado encontrado para &quot;{query}&quot;
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer Info */}
        <div className="text-center py-4 text-xs text-muted-foreground border-t border-border/50 mt-4">
          Pressione <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> para fechar
        </div>
      </div>
    </div>
  );
}
