import { Header } from "@/components/header";
import { HeroBanner } from "@/components/hero-banner";
import { RecentContentsRow } from "@/components/recent-contents-row";
import { ContentRow } from "@/components/content-row";
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getNowPlayingMovies,
} from "@/lib/tmdb";

export const revalidate = 3600; // Cache por 1 hora

export default async function HomePage() {
  const [trending, popularMovies, popularTV, topRated, nowPlaying] = await Promise.all([
    getTrending("all", "week"),
    getPopularMovies(),
    getPopularTVShows(),
    getTopRatedMovies(),
    getNowPlayingMovies(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <HeroBanner items={trending.results.slice(0, 5)} />
      
      <div className="-mt-32 relative z-10">
        <RecentContentsRow />
        <ContentRow title="Em Alta" items={trending.results.slice(1, 20)} />
        <ContentRow title="Filmes Populares" items={popularMovies.results} />
        <ContentRow title="Séries Populares" items={popularTV.results} />
        <ContentRow title="Mais Bem Avaliados" items={topRated.results} />
        <ContentRow title="Nos Cinemas" items={nowPlaying.results} />
      </div>

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            CineFlux - Todos os dados fornecidos por TMDB
          </p>
        </div>
      </footer>
    </main>
  );
}
