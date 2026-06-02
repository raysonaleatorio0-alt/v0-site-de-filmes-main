export const dynamic = 'force-dynamic';
import { Header } from "@/components/header";
import { SearchClient } from "@/components/search-client";
import { Suspense } from "react"; // Adicionado aqui

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Pesquisar
          </h1>

          {/* O Suspense foi adicionado em volta do SearchClient */}
          <Suspense fallback={<div className="text-muted-foreground">Carregando pesquisa...</div>}>
            <SearchClient />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            CineFlux - Todos os dados fornecidos por TMDB e MEGAEMBED
          </p>
        </div>
      </footer>
    </main>
  );
}