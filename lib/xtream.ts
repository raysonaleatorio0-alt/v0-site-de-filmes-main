const XTREAM_API_URL = "https://mgeb.top/player_api.php";
const XTREAM_MOVIE_API = "https://mgeb.top/api/movie";
const XTREAM_SERIES_API = "https://mgeb.top/api/series";
const XTREAM_USERNAME = "rsnvo090";
const XTREAM_PASSWORD = "$2y$10$au1WiGj70iO9AyECOHaVAeMsJuM9VOnTijwF82jy8rUQmcXrSg4/.";

export interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamVOD {
  stream_id: string;
  name: string;
  title: string;
  year: string;
  rating: string;
  rating_5based: string;
  image: string;
  director: string;
  actors: string;
  plot: string;
  duration: string;
}

export interface XtreamLive {
  num: number;
  name: string;
  stream_id: string;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface XtreamServerInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  port: string;
  https_port: string;
  server_protocol: string;
  rtmp_port: string;
  timezone: string;
  timestamp_now: string;
  time_now: string;
  process: number;
  level: number;
  seconds_watched: number;
  available_channels: number;
  available_series: number;
  available_vod: number;
  streaming_protocol: string;
  planet_ftp_available: number;
  active_cons: string;
  max_connections: string;
  allowed_output_formats: string[];
  image_base_url: string;
}

async function fetchXtreamAPI(action: string, params: Record<string, string> = {}) {
  try {
    const queryParams = new URLSearchParams({
      username: XTREAM_USERNAME,
      password: XTREAM_PASSWORD,
      action,
      ...params,
    });

    const response = await fetch(`${XTREAM_API_URL}?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao chamar Xtream API:", error);
    throw error;
  }
}

export async function getXtreamServerInfo(): Promise<XtreamServerInfo> {
  return fetchXtreamAPI("get_live_categories");
}

export async function searchXtreamVOD(search: string): Promise<XtreamVOD[]> {
  try {
    const response = await fetchXtreamAPI("search", { search });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Erro ao buscar VOD no Xtream:", error);
    return [];
  }
}

export async function getXtreamVODCategories(): Promise<XtreamCategory[]> {
  try {
    const response = await fetchXtreamAPI("get_vod_categories");
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Erro ao obter categorias VOD do Xtream:", error);
    return [];
  }
}

export async function getXtreamVODByCategory(
  categoryId: string
): Promise<XtreamVOD[]> {
  try {
    const response = await fetchXtreamAPI("get_vod_streams", {
      category_id: categoryId,
    });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Erro ao obter VODs por categoria:", error);
    return [];
  }
}

export function getXtreamVODStreamURL(streamId: string): string {
  return `${XTREAM_API_URL}?username=${XTREAM_USERNAME}&password=${XTREAM_PASSWORD}&type=movie&output=ts&video_id=${streamId}`;
}

export async function getXtreamStreamData(streamId: string): Promise<any> {
  try {
    const url = getXtreamVODStreamURL(streamId);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Pode retornar JSON ou ser um stream direto
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return await response.json();
    } else {
      // Se for stream direto, retornar a URL
      return { url };
    }
  } catch (error) {
    console.error("Erro ao obter dados de stream:", error);
    throw error;
  }
}

export async function getXtreamLiveCategories(): Promise<XtreamCategory[]> {
  try {
    const response = await fetchXtreamAPI("get_live_categories");
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Erro ao obter categorias Live:", error);
    return [];
  }
}

export async function getXtreamLiveByCategory(
  categoryId: string
): Promise<XtreamLive[]> {
  try {
    const response = await fetchXtreamAPI("get_live_streams", {
      category_id: categoryId,
    });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Erro ao obter streams Live:", error);
    return [];
  }
}

export function getXtreamLiveStreamURL(streamId: string): string {
  return `${XTREAM_API_URL}?username=${XTREAM_USERNAME}&password=${XTREAM_PASSWORD}&type=live&channel=${streamId}`;
}

export async function findXtreamContentByTitle(
  title: string,
  contentType: "movie" | "tv" = "movie"
): Promise<XtreamVOD | null> {
  try {
    const apiUrl = contentType === "movie" ? XTREAM_MOVIE_API : XTREAM_SERIES_API;
    
    console.log(`[Xtream] Buscando ${contentType}: ${title} em ${apiUrl}`);

    // Fazer requisição para a API
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data : data.results || [];

    console.log(`[Xtream] Total de resultados: ${results.length}`);

    // Buscar por título exato
    let found = results.find((item: any) =>
      (item.title || item.name || "").toLowerCase() === title.toLowerCase()
    );

    // Se não encontrou exato, buscar por similaridade
    if (!found) {
      found = results.find((item: any) =>
        (item.title || item.name || "")
          .toLowerCase()
          .includes(title.toLowerCase())
      );
    }

    if (found) {
      console.log(`[Xtream] Conteúdo encontrado:`, {
        id: found.stream_id || found.id,
        title: found.title || found.name,
        url: found.url,
        stream_url: found.stream_url,
      });

      return {
        stream_id: found.stream_id || found.id || "",
        name: found.name || found.title || "",
        title: found.title || found.name || "",
        year: found.year || "",
        rating: found.rating || "",
        rating_5based: found.rating_5based || "",
        image: found.image || found.poster || "",
        director: found.director || "",
        actors: found.actors || "",
        plot: found.plot || found.overview || "",
        duration: found.duration || "",
      };
    }

    console.log(`[Xtream] Conteúdo "${title}" não encontrado`);
    return null;
  } catch (error) {
    console.error("Erro ao buscar conteúdo no Xtream:", error);
    return null;
  }
}
