import { NextResponse } from "next/server";
import { searchMulti } from "@/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";

  if (!query) {
    return NextResponse.json({ results: [], page: 1, total_pages: 0, total_results: 0 });
  }

  try {
    // Usar searchMulti para retornar filmes, séries e pessoas
    const results = await searchMulti(query, parseInt(page));

    return NextResponse.json(results);
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json({ results: [], page: 1, total_pages: 0, total_results: 0 }, { status: 500 });
  }
}
