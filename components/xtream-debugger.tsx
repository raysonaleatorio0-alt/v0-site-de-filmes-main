"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function XtreamDebugger() {
  const [title, setTitle] = useState("The Matrix");
  const [contentType, setContentType] = useState<"movie" | "series">("movie");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`[XtreamDebugger] Testando: ${title} (${contentType})`);

      const response = await fetch(
        `/api/debug/xtream?title=${encodeURIComponent(title)}&type=${contentType}`
      );

      console.log(`[XtreamDebugger] Response status: ${response.status}`);

      const data = await response.json();

      console.log(`[XtreamDebugger] Response data:`, data);

      setResult(data);

      if (!data.success || !data.found) {
        setError(
          data.message ||
            "Conteúdo não encontrado. Tente outro título ou veja os resultados disponíveis."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      console.error(`[XtreamDebugger] Erro:`, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
      >
        🐛 Debug Xtream
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-100">
          🐛 Debug Xtream
        </span>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-gray-200 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="overflow-auto flex-1 p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: The Matrix"
            className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-gray-100 placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Tipo
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as any)}
            className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-gray-100"
          >
            <option value="movie">Filme</option>
            <option value="series">Série</option>
          </select>
        </div>

        <Button
          onClick={handleTest}
          disabled={loading}
          size="sm"
          className="w-full text-xs"
        >
          {loading ? "Testando..." : "Testar"}
        </Button>

        {error && (
          <div className="text-xs bg-red-900/30 border border-red-700 p-2 rounded text-red-300">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {result && (
          <div className="text-xs bg-gray-800 border border-gray-700 p-2 rounded text-gray-300 max-h-40 overflow-auto">
            <pre className="font-mono whitespace-pre-wrap break-words">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
