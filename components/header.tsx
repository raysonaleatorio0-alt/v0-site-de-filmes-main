"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Play, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SearchModal } from "@/components/search-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const isAdmin = useIsAdmin();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background/95 via-background/80 to-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 text-xl font-bold text-primary">
            CineFlux
            <Play className="h-5 w-5 fill-primary" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link href="/navegar" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Navegar
            </Link>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pesquisar
            </button>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuário"} />
                            <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <span className="hidden md:inline text-sm font-medium truncate max-w-[150px]">
                            {user.displayName || "Usuário"}
                          </span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push("/favoritos")}>
                          Meus Favoritos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
                          <LogOut className="h-4 w-4" />
                          Sair
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={signInWithGoogle} className="hidden md:flex">
                    Fazer Login
                  </Button>
                )}
              </>
            )}
            {isAdmin && (
              <Link href="/dashboard">
                <Button size="sm" className="gap-2">
                  Painel Moderador
                  <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-sm font-medium text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                Início
              </Link>
              <Link href="/navegar" className="text-sm font-medium text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                Navegar
              </Link>
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-sm font-medium text-muted-foreground text-left"
              >
                Pesquisar
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
