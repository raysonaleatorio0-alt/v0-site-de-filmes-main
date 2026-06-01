"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl">
          <Link href="/">
            <Button variant="ghost" className="mb-8">← Voltar</Button>
          </Link>

          <h1 className="text-3xl font-bold mb-8">Configurações de Administrador</h1>

          {loading ? (
            <div className="text-muted-foreground">Carregando informações do usuário...</div>
          ) : user ? (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Seu Email</h2>
              <div className="bg-background rounded p-4 font-mono text-sm break-all">
                {user.email}
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                <h3 className="font-semibold mb-2">Para virar administrador:</h3>
                <p className="text-sm mb-4">
                  Abra o arquivo <code className="bg-background px-2 py-1 rounded">hooks/use-is-admin.ts</code> e adicione seu email à lista <code>ADMIN_EMAILS</code>:
                </p>
                <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`const ADMIN_EMAILS = [
  "${user.email}", // Seu email
];`}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Você precisa fazer login para ver essas configurações.</p>
              <Link href="/">
                <Button>Voltar para Home</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
