import { TMDBMovie } from "@/lib/tmdb";

export interface Episode {
  season: number;
  episode: number;
  url: string;
}

export interface CustomContent {
  id: string;
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string;
  embedUrl?: string;
  episodes?: Episode[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentStore {
  contents: CustomContent[];
}

const STORAGE_KEY = "cineflux_contents";

export function getStoredContents(): CustomContent[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const data: ContentStore = JSON.parse(stored);
    return data.contents || [];
  } catch {
    return [];
  }
}

export function saveContents(contents: CustomContent[]): void {
  if (typeof window === "undefined") return;
  const data: ContentStore = { contents };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addContent(content: Omit<CustomContent, "id" | "createdAt" | "updatedAt">): CustomContent {
  const contents = getStoredContents();
  const newContent: CustomContent = {
    ...content,
    id: `${content.type}_${content.tmdbId}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  contents.push(newContent);
  saveContents(contents);
  return newContent;
}

export function updateContent(id: string, updates: Partial<CustomContent>): CustomContent | null {
  const contents = getStoredContents();
  const index = contents.findIndex((c) => c.id === id);
  if (index === -1) return null;
  
  contents[index] = {
    ...contents[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveContents(contents);
  return contents[index];
}

export function deleteContent(id: string): boolean {
  const contents = getStoredContents();
  const filtered = contents.filter((c) => c.id !== id);
  if (filtered.length === contents.length) return false;
  saveContents(filtered);
  return true;
}

export function getContentByTmdbId(tmdbId: number, type: "movie" | "tv"): CustomContent | null {
  const contents = getStoredContents();
  return contents.find((c) => c.tmdbId === tmdbId && c.type === type) || null;
}

export function getRecentContents(limit: number = 10): CustomContent[] {
  const contents = getStoredContents();
  return contents
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function tmdbToCustomContent(
  item: TMDBMovie,
  type: "movie" | "tv",
  embedUrl?: string
): Omit<CustomContent, "id" | "createdAt" | "updatedAt"> {
  return {
    tmdbId: item.id,
    type,
    title: item.title || item.name || "",
    overview: item.overview,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    voteAverage: item.vote_average,
    releaseDate: item.release_date || item.first_air_date || "",
    embedUrl,
    episodes: [],
    featured: false,
  };
}

export function addEpisode(contentId: string, season: number, episode: number, url: string): boolean {
  const contents = getStoredContents();
  const index = contents.findIndex((c) => c.id === contentId);
  
  if (index === -1) return false;
  
  if (!contents[index].episodes) {
    contents[index].episodes = [];
  }

  // Remover episódio existente com mesma temporada/episódio
  contents[index].episodes = contents[index].episodes!.filter(
    (e) => !(e.season === season && e.episode === episode)
  );

  // Adicionar novo episódio
  contents[index].episodes!.push({ season, episode, url });
  contents[index].updatedAt = new Date().toISOString();
  
  saveContents(contents);
  return true;
}

export function getEpisodes(contentId: string): Episode[] {
  const contents = getStoredContents();
  const content = contents.find((c) => c.id === contentId);
  return content?.episodes || [];
}

export function getEpisodeUrl(contentId: string, season: number, episode: number): string | null {
  const episodes = getEpisodes(contentId);
  const ep = episodes.find((e) => e.season === season && e.episode === episode);
  return ep?.url || null;
}

export function removeEpisode(contentId: string, season: number, episode: number): boolean {
  const contents = getStoredContents();
  const index = contents.findIndex((c) => c.id === contentId);
  
  if (index === -1) return false;
  
  if (!contents[index].episodes) return false;
  
  const before = contents[index].episodes!.length;
  contents[index].episodes = contents[index].episodes!.filter(
    (e) => !(e.season === season && e.episode === episode)
  );
  
  if (contents[index].episodes!.length === before) return false;
  
  contents[index].updatedAt = new Date().toISOString();
  saveContents(contents);
  return true;
}
