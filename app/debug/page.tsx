"use client";

import { useState } from "react";

export default function DebugPage() {
  const [title, setTitle] = useState("The Matrix");
  const [type, setType] = useState("movie");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/debug/xtream?title=${encodeURIComponent(title)}&type=${type}`
      );
      const data = await response.json();

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Xtream</h1>

      <div className="space-y-4 bg-secondary p-4 rounded-lg mb-6">
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded"
          >
            <option value="movie">Filme</option>
            <option value="tv">Série</option>
          </select>
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Testando..." : "Testar"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded mb-6 text-red-100">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-background border border-border p-4 rounded">
          <pre className="overflow-auto text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
