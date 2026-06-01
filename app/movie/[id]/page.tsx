import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Calendar, Clock, Users } from "lucide-react";
import { Header } from "@/components/header";
import { ContentRow } from "@/components/content-row";
import { MoviePlayer } from "@/components/movie-player";
import { FavoriteButton } from "@/components/favorite-button";
import { getMovieDetails, getImageUrl, getTrending } from "@/lib/tmdb";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  
  let movie;
  try {
    movie = await getMovieDetails(Number(id));
  } catch {
    notFound();
  }

  const [trending] = await Promise.all([getTrending("movie", "week")]);

  const backdropUrl = getImageUrl(movie.backdrop_path, "original");
  const posterUrl = getImageUrl(movie.poster_path, "w500");
  const year = movie.release_date?.split("-")[0] || "";
  const hours = Math.floor((movie.runtime || 0) / 60);
  const minutes = (movie.runtime || 0) % 60;
  const trailer = movie.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px]">
        <div className="absolute inset-0">
          <Image
            src={backdropUrl}
            alt={movie.title || ""}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative h-full container mx-auto px-4 flex items-end pb-12">
          <div className="flex gap-8 items-end">
            {/* Poster */}
            <div className="hidden md:block flex-shrink-0 w-64 aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={posterUrl}
                alt={movie.title || ""}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 max-w-2xl">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>

              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">
                  {movie.tagline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-yellow-500" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
                {year && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{year}</span>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{hours}h {minutes}min</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 text-xs font-medium bg-secondary rounded-full"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 mb-6">
                <MoviePlayer
                  movieId={movie.id}
                  movieTitle={movie.title}
                  trailer={trailer}
                />
                <FavoriteButton 
                  contentId={movie.id} 
                  contentType="movie"
                  showText
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Synopsis */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            Sinopse
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-4xl">
            {movie.overview || "Sinopse não disponível."}
          </p>
        </section>

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              <Users className="h-5 w-5" />
              Elenco
            </h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {movie.credits.cast.slice(0, 12).map((actor) => (
                <div key={actor.id} className="flex-shrink-0 w-28 text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-secondary mx-auto mb-2">
                    <Image
                      src={getImageUrl(actor.profile_path, "w500")}
                      alt={actor.name}
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {actor.name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {actor.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Related */}
      <ContentRow title="Filmes Relacionados" items={trending.results.slice(0, 10)} />

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
