export const dynamic = 'force-dynamic';
import { Header } from "@/components/header";
import { ContentRow } from "@/components/content-row";
import {
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getUpcomingMovies,
  getNowPlayingMovies,
} from "@/lib/tmdb";

export default async function BrowsePage() {
  const [popularMovies, popularTV, topRatedMovies, topRatedTV, upcoming, nowPlaying] =
    await Promise.all([
      getPopularMovies(),
      getPopularTVShows(),
      getTopRatedMovies(),
      getTopRatedTVShows(),
      getUpcomingMovies(),
      getNowPlayingMovies(),
    ]);

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Navegar</h1>
          <p className="text-muted-foreground">
            Explore todos os filmes e séries disponíveis
          </p>
        </div>

        <ContentRow title="Filmes Populares" items={popularMovies.results} />
        <ContentRow title="Séries Populares" items={popularTV.results} />
        <ContentRow title="Filmes Mais Bem Avaliados" items={topRatedMovies.results} />
        <ContentRow title="Séries Mais Bem Avaliadas" items={topRatedTV.results} />
        <ContentRow title="Em Breve nos Cinemas" items={upcoming.results} />
        <ContentRow title="Nos Cinemas Agora" items={nowPlaying.results} />
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
