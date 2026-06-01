const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: "movie" | "tv";
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres: { id: number; name: string }[];
  tagline?: string;
  status: string;
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  episode_count: number;
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  vote_average: number;
}

export interface TMDBSeasonDetails {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  episodes: TMDBEpisode[];
}

export function getImageUrl(path: string | null, size: "w500" | "w780" | "w1280" | "original" = "w500"): string {
  if (!path) return "/placeholder.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY || "",
    language: "pt-BR",
    ...params,
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

async function fetchTMDBMultiLang<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  // Para buscas, tenta primeiro em inglês (mais resultados), depois em português
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY || "",
    // Sem forçar linguagem específica para obter mais resultados
    ...params,
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

export async function getTrending(mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week") {
  return fetchTMDB<TMDBResponse>(`/trending/${mediaType}/${timeWindow}`);
}

export async function getPopularMovies() {
  return fetchTMDB<TMDBResponse>("/movie/popular");
}

export async function getPopularTVShows() {
  return fetchTMDB<TMDBResponse>("/tv/popular");
}

export async function getTopRatedMovies() {
  return fetchTMDB<TMDBResponse>("/movie/top_rated");
}

export async function getTopRatedTVShows() {
  return fetchTMDB<TMDBResponse>("/tv/top_rated");
}

export async function getNowPlayingMovies() {
  return fetchTMDB<TMDBResponse>("/movie/now_playing");
}

export async function getUpcomingMovies() {
  return fetchTMDB<TMDBResponse>("/movie/upcoming");
}

export async function getMovieDetails(id: number) {
  return fetchTMDB<TMDBMovieDetails>(`/movie/${id}`, {
    append_to_response: "videos,credits",
  });
}

export async function getTVDetails(id: number) {
  return fetchTMDB<TMDBMovieDetails>(`/tv/${id}`, {
    append_to_response: "videos,credits,seasons",
  });
}

export async function detectTVSeasons(tvId: number, apiNumberOfSeasons?: number): Promise<number> {
  // Se a API retornar um número válido e maior que 0, confia
  if (apiNumberOfSeasons && apiNumberOfSeasons > 1) {
    return apiNumberOfSeasons;
  }

  // Caso contrário, tenta descobrir buscando as temporadas
  let detectedSeasons = apiNumberOfSeasons || 1;
  try {
    for (let season = 1; season <= 20; season++) {
      try {
        await getTVSeasonDetails(tvId, season);
        detectedSeasons = season;
      } catch {
        break;
      }
    }
  } catch (error) {
    console.error("Erro ao detectar temporadas:", error);
  }

  return Math.max(detectedSeasons, 1);
}

export async function getTVSeasonDetails(tvId: number, seasonNumber: number) {
  return fetchTMDB<TMDBSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function searchMulti(query: string, page: number = 1) {
  return fetchTMDBMultiLang<TMDBResponse>("/search/multi", { query, page: page.toString() });
}

export async function searchMovies(query: string, page: number = 1) {
  return fetchTMDBMultiLang<TMDBResponse>("/search/movie", { query, page: page.toString() });
}

export async function searchTVShows(query: string, page: number = 1) {
  return fetchTMDBMultiLang<TMDBResponse>("/search/tv", { query, page: page.toString() });
}

export async function getGenres(mediaType: "movie" | "tv" = "movie") {
  return fetchTMDB<{ genres: { id: number; name: string }[] }>(`/genre/${mediaType}/list`);
}

export async function discoverByGenre(mediaType: "movie" | "tv", genreId: number) {
  return fetchTMDB<TMDBResponse>(`/discover/${mediaType}`, {
    with_genres: genreId.toString(),
  });
}
