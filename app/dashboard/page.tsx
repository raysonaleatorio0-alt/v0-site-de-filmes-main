"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Play,
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Star,
  Edit,
  Film,
  Tv,
  X,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useAuth } from "@/hooks/use-auth";
import {
  CustomContent,
  getStoredContents,
  addContent,
  deleteContent,
  updateContent,
  tmdbToCustomContent,
  addEpisode,
  removeEpisode,
  getEpisodes,
} from "@/lib/content-store";
import { TMDBMovie, getImageUrl } from "@/lib/tmdb";

type Tab = "all" | "movies" | "series";

export default function DashboardPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { loading } = useAuth();
  
  const [contents, setContents] = useState<CustomContent[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [filterQuery, setFilterQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TMDBMovie | null>(null);
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [embedUrl, setEmbedUrl] = useState("");
  const [editingContent, setEditingContent] = useState<CustomContent | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<{ season: number; episode: number; url: string } | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);

  // Verificar permissões de admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    setContents(getStoredContents());
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/tmdb/search?q=${encodeURIComponent(searchQuery)}&type=${contentType}`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleAddContent = () => {
    if (!selectedItem) return;
    
    const newContent = addContent(
      tmdbToCustomContent(selectedItem, contentType, embedUrl)
    );
    setContents([...contents, newContent]);
    
    // Reset modal
    setIsAddModalOpen(false);
    setSelectedItem(null);
    setSearchQuery("");
    setSearchResults([]);
    setEmbedUrl("");
  };

  const handleDeleteContent = (id: string) => {
    if (confirm("Tem certeza que deseja remover este conteúdo?")) {
      deleteContent(id);
      setContents(contents.filter((c) => c.id !== id));
    }
  };

  const handleToggleFeatured = (id: string) => {
    const updated = updateContent(id, {
      featured: !contents.find((c) => c.id === id)?.featured,
    });
    if (updated) {
      setContents(contents.map((c) => (c.id === id ? updated : c)));
    }
  };

  const handleUpdateEmbedUrl = () => {
    if (!editingContent) return;
    const updated = updateContent(editingContent.id, { embedUrl });
    if (updated) {
      setContents(contents.map((c) => (c.id === editingContent.id ? updated : c)));
    }
    setEditingContent(null);
    setEmbedUrl("");
  };

  const handleAddEpisode = () => {
    if (!editingContent || !editingEpisode) return;
    addEpisode(editingContent.id, editingEpisode.season, editingEpisode.episode, editingEpisode.url);
    const eps = getEpisodes(editingContent.id);
    setEpisodes(eps);
    setEditingEpisode(null);
  };

  const handleRemoveEpisode = (season: number, episode: number) => {
    if (!editingContent) return;
    removeEpisode(editingContent.id, season, episode);
    const eps = getEpisodes(editingContent.id);
    setEpisodes(eps);
  };

  const handleOpenEditModal = (content: CustomContent) => {
    setEditingContent(content);
    setEmbedUrl(content.embedUrl || "");
    if (content.type === "tv") {
      setEpisodes(getEpisodes(content.id));
    }
  };

  const filteredContents = contents.filter((c) => {
    // Filtro por tipo (tab)
    if (activeTab === "movies" && c.type !== "movie") return false;
    if (activeTab === "series" && c.type !== "tv") return false;
    
    // Filtro por busca
    if (filterQuery.trim()) {
      const query = filterQuery.toLowerCase();
      return c.title.toLowerCase().includes(query);
    }
    
    return true;
  });

  const stats = {
    total: contents.length,
    movies: contents.filter((c) => c.type === "movie").length,
    series: contents.filter((c) => c.type === "tv").length,
    featured: contents.filter((c) => c.featured).length,
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Site
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Play className="h-5 w-5 text-primary fill-primary" />
                Painel CineFlux
              </h1>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Conteúdo
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Film className="h-4 w-4" /> Filmes
            </p>
            <p className="text-2xl font-bold text-foreground">{stats.movies}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Tv className="h-4 w-4" /> Séries
            </p>
            <p className="text-2xl font-bold text-foreground">{stats.series}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Star className="h-4 w-4" /> Destaques
            </p>
            <p className="text-2xl font-bold text-foreground">{stats.featured}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "movies", "series"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tab === "all" ? "Todos" : tab === "movies" ? "Filmes" : "Séries"}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar conteúdos para editar..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content List */}
        {filteredContents.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border border-border">
            <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum conteúdo cadastrado ainda
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Primeiro Conteúdo
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredContents.map((content) => (
              <div
                key={content.id}
                className="flex items-center gap-4 bg-card rounded-lg p-4 border border-border"
              >
                <div className="w-16 h-24 rounded overflow-hidden bg-secondary flex-shrink-0">
                  <Image
                    src={getImageUrl(content.posterPath, "w500")}
                    alt={content.title}
                    width={64}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground truncate">
                      {content.title}
                    </h3>
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded">
                      {content.type === "movie" ? "Filme" : "Série"}
                    </span>
                    {content.featured && (
                      <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {content.overview}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {content.voteAverage.toFixed(1)}
                    </span>
                    <span>{content.releaseDate?.split("-")[0]}</span>
                    {content.embedUrl && (
                      <span className="flex items-center gap-1 text-green-500">
                        <Check className="h-3 w-3" />
                        URL configurada
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFeatured(content.id)}
                    className={content.featured ? "text-primary" : ""}
                  >
                    <Star className={`h-4 w-4 ${content.featured ? "fill-primary" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal(content)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Link href={`/${content.type}/${content.tmdbId}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteContent(content.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Content Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Adicionar Conteúdo</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedItem(null);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Type Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setContentType("movie")}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    contentType === "movie"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <Film className="h-4 w-4" />
                  Filme
                </button>
                <button
                  onClick={() => setContentType("tv")}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    contentType === "tv"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <Tv className="h-4 w-4" />
                  Série
                </button>
              </div>

              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Pesquisar ${contentType === "movie" ? "filme" : "série"}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? "Buscando..." : "Buscar"}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-border rounded-lg divide-y divide-border max-h-60 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/50 transition-colors ${
                        selectedItem?.id === item.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="w-10 h-14 rounded overflow-hidden bg-secondary flex-shrink-0">
                        <Image
                          src={getImageUrl(item.poster_path, "w500")}
                          alt={item.title || item.name || ""}
                          width={40}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.title || item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(item.release_date || item.first_air_date)?.split("-")[0]}
                        </p>
                      </div>
                      {selectedItem?.id === item.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Item Preview */}
              {selectedItem && (
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Selecionado:</p>
                  <div className="flex gap-3">
                    <div className="w-16 h-24 rounded overflow-hidden bg-secondary flex-shrink-0">
                      <Image
                        src={getImageUrl(selectedItem.poster_path, "w500")}
                        alt={selectedItem.title || selectedItem.name || ""}
                        width={64}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedItem.title || selectedItem.name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {selectedItem.overview}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Embed URL */}
              {selectedItem && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    URL do Player (opcional)
                  </label>
                  <Input
                    placeholder="https://embed.example.com/..."
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole a URL do player embed para assistir diretamente
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedItem(null);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddContent} disabled={!selectedItem}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Editar: {editingContent.title}</h2>
              <button
                onClick={() => {
                  setEditingContent(null);
                  setEmbedUrl("");
                  setEditingEpisode(null);
                  setEpisodes([]);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* URL do Player */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  URL do Player
                </label>
                <Input
                  placeholder="https://embed.example.com/..."
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Para séries/animes, essa URL será usada como padrão se nenhum episódio for selecionado
                </p>
              </div>

              {/* Gerenciador de Episódios para Séries */}
              {editingContent.type === "tv" && (
                <div className="border-t border-border pt-4">
                  <h3 className="font-medium text-foreground mb-4">Gerenciar Episódios</h3>

                  {/* Adicionar Episódio */}
                  <div className="bg-secondary/30 rounded-lg p-4 mb-4 space-y-3">
                    <p className="text-sm text-muted-foreground">Adicionar nova URL de episódio:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Temporada</label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={editingEpisode?.season || ""}
                          onChange={(e) =>
                            setEditingEpisode({
                              ...editingEpisode,
                              season: parseInt(e.target.value) || 1,
                            } as any)
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Episódio</label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={editingEpisode?.episode || ""}
                          onChange={(e) =>
                            setEditingEpisode({
                              ...editingEpisode,
                              episode: parseInt(e.target.value) || 1,
                            } as any)
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Ação</label>
                        <Button
                          size="sm"
                          onClick={() =>
                            setEditingEpisode({
                              season: editingEpisode?.season || 1,
                              episode: editingEpisode?.episode || 1,
                              url: "",
                            })
                          }
                          className="w-full"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                    {editingEpisode && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          URL T{editingEpisode.season}E{editingEpisode.episode}
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://..."
                            value={editingEpisode.url}
                            onChange={(e) =>
                              setEditingEpisode({
                                ...editingEpisode,
                                url: e.target.value,
                              })
                            }
                          />
                          <Button onClick={handleAddEpisode} size="sm">
                            Salvar
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingEpisode(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lista de Episódios */}
                  {episodes.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Episódios cadastrados:</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {episodes
                          .sort((a, b) => a.season - b.season || a.episode - b.episode)
                          .map((ep) => (
                            <div
                              key={`${ep.season}-${ep.episode}`}
                              className="flex items-center justify-between bg-secondary/50 rounded p-3 text-sm"
                            >
                              <div>
                                <p className="font-medium text-foreground">
                                  T{ep.season}E{ep.episode}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {ep.url}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEpisode(ep.season, ep.episode)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingContent(null);
                  setEmbedUrl("");
                  setEditingEpisode(null);
                  setEpisodes([]);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateEmbedUrl}>Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
