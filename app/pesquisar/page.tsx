import { Header } from "@/components/header";
import { SearchClient } from "@/components/search-client";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Pesquisar
          </h1>

          <SearchClient />
        </div>
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
