import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get("title") || "The Matrix";
    const type = searchParams.get("type") || "movie";

    const apiUrl =
      type === "movie"
        ? "https://mgeb.top/api/movie"
        : "https://mgeb.top/api/series";

    console.log(`[Xtream Debug] Buscando ${type}: ${title}`);
    console.log(`[Xtream Debug] URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
      },
    });

    console.log(`[Xtream Debug] Status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      console.log(`[Xtream Debug] Erro response: ${text}`);
      return NextResponse.json(
        {
          error: `HTTP ${response.status}`,
          url: apiUrl,
          details: text,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`[Xtream Debug] Resposta recebida. Tipo: ${Array.isArray(data) ? "array" : typeof data}`);
    console.log(`[Xtream Debug] Primeiro item:`, data[0]);
    
    if (Array.isArray(data)) {
      console.log(`[Xtream Debug] Primeiros 3 itens:`, data.slice(0, 3));
    }

    const results = Array.isArray(data) ? data : data.results || [];

    console.log(`[Xtream Debug] Total de resultados: ${results.length}`);

    // Buscar por título exato
    const found = results.find(
      (item: any) =>
        (item.title || item.name || "").toLowerCase() === title.toLowerCase()
    );

    // Se não encontrou exato, buscar por similaridade
    const foundSimilar = !found && results.find(
      (item: any) =>
        (item.title || item.name || "")
          .toLowerCase()
          .includes(title.toLowerCase())
    );

    const content = found || foundSimilar;

    if (content) {
      console.log(`[Xtream Debug] Conteúdo encontrado:`, content);
      const streamId = content.stream_id || content.id;
      const streamUrl = `https://mgeb.top/player_api.php?username=rsnvo090&password=%242y%2410%24au1WiGj70iO9AyECOHaVAeMsJuM9VOnTijwF82jy8rUQmcXrSg4%2F.&type=${type === "movie" ? "movie" : "series"}&output=ts&video_id=${streamId}`;

      return NextResponse.json({
        success: true,
        found: true,
        content: {
          id: streamId,
          title: content.title || content.name,
          image: content.image,
          year: content.year,
          plot: content.plot,
        },
        streamUrl,
      });
    }

    // Se não encontrou, retornar primeiros resultados para debug
    return NextResponse.json({
      success: true,
      found: false,
      message: `Conteúdo "${title}" não encontrado`,
      firstResults: results.slice(0, 3),
      totalAvailable: results.length,
    });
  } catch (error) {
    console.error("[Xtream Debug] Erro:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
