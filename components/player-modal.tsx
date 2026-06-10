"use client";

import { useState, useEffect, useRef } from "react";
import { X, Settings, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Quality {
  label: string;
  url: string;
}

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl?: string;
  title: string;
}

export function PlayerModal({ isOpen, onClose, embedUrl, title }: PlayerModalProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string | null>(null);
  const [playerType, setPlayerType] = useState<"video" | "iframe" | "error">("error");
  const [loading, setLoading] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();
  const iframeLoadTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isOpen || !embedUrl) {
      setLoading(false);
      setResolvedUrl(null);
      setQualities([]);
      setCurrentQuality(null);
      setPlayerType("error");
      return;
    }

    const resolveUrl = async () => {
      try {
        // Se for MegaEmbed ou mgeb.top embed, usar como iframe
        if (embedUrl.includes("megaembed.com") || embedUrl.includes("mgeb.top")) {
          console.log("✅ Detectado MegaEmbed/mgeb.top:", embedUrl);
          // Evitar reload desnecessário
          if (resolvedUrl !== embedUrl) {
            setResolvedUrl(embedUrl);
            setPlayerType("iframe");
          }
          setLoading(false);
          return;
        }

        // Se for arquivo .txt, fazer fetch e extrair as URLs
        if (embedUrl.endsWith(".txt")) {
          const response = await fetch(embedUrl);
          const text = await response.text();
          
          // Extrair todas as linhas com URLs
          const lines = text.split("\n").map((line) => line.trim()).filter((line) => line && line.startsWith("http"));
          
          // Tentar identificar resoluções nas URLs
          const qualityMap: Record<string, Quality[]> = {};
          
          lines.forEach((url) => {
            // Detectar resolução pela URL ou extensão
            let quality = "Padrão";
            
            if (url.includes("1080")) quality = "1080p";
            else if (url.includes("720")) quality = "720p";
            else if (url.includes("480")) quality = "480p";
            else if (url.includes("360")) quality = "360p";
            else if (url.includes("240")) quality = "240p";
            else if (url.includes("hd")) quality = "HD";
            else if (url.includes("sd")) quality = "SD";
            
            if (!qualityMap[quality]) {
              qualityMap[quality] = [];
            }
            qualityMap[quality].push({ label: quality, url });
          });

          // Se não encontrou resoluções específicas, criar padrão
          if (lines.length > 0 && Object.keys(qualityMap).length === 0) {
            lines.forEach((url, index) => {
              const qualities_list = ["1080p", "720p", "480p"];
              const quality = qualities_list[index] || "Padrão";
              qualityMap[quality] = [{ label: quality, url }];
            });
          }

          const allQualities = Object.values(qualityMap).flat();
          
          if (allQualities.length > 0) {
            setQualities(allQualities);
            // Preferir 720p, depois 1080p, depois a primeira disponível
            const preferred = allQualities.find(q => q.label === "720p") || 
                            allQualities.find(q => q.label === "1080p") ||
                            allQualities[0];
            setResolvedUrl(preferred.url);
            setCurrentQuality(preferred.label);
            setPlayerType("video");
          } else {
            setPlayerType("error");
          }
        }
        // Se for vídeo direto ou stream
        else if (embedUrl.includes(".m3u8") || embedUrl.includes(".mp4")) {
          setResolvedUrl(embedUrl);
          setCurrentQuality("Padrão");
          setQualities([{ label: "Padrão", url: embedUrl }]);
          setPlayerType("video");
        }
        // Se for iframe embed
        else {
          setResolvedUrl(embedUrl);
          setPlayerType("iframe");
        }
      } catch (error) {
        console.error("Erro ao resolver URL:", error);
        setPlayerType("error");
      } finally {
        setLoading(false);
      }
    };

    resolveUrl();
  }, [embedUrl, isOpen]);

  // Inicializar HLS.js para streams .m3u8 se necessário
  useEffect(() => {
    if (playerType === "video" && videoRef.current && resolvedUrl?.includes(".m3u8")) {
      const loadHLS = async () => {
        try {
          const HLS = (await import("hls.js")).default;

          if (HLS.isSupported()) {
            const hls = new HLS();
            hls.loadSource(resolvedUrl);
            hls.attachMedia(videoRef.current!);
          } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
            // Para Safari que suporta HLS nativamente
            videoRef.current.src = resolvedUrl;
          }
        } catch (error) {
          console.error("Erro ao carregar HLS.js:", error);
          // Fallback para vídeo direto
          if (videoRef.current) {
            videoRef.current.src = resolvedUrl;
          }
        }
      };

      loadHLS();
    } else if (playerType === "video" && videoRef.current && resolvedUrl) {
      videoRef.current.src = resolvedUrl;
    }
  }, [playerType, resolvedUrl]);

  const handleQualityChange = (quality: Quality) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const isPlaying = !videoRef.current.paused;
      
      setResolvedUrl(quality.url);
      setCurrentQuality(quality.label);
      setShowQualityMenu(false);

      // Restaurar o tempo e retomar a reprodução
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          if (isPlaying) {
            videoRef.current.play();
          }
        }
      }, 100);
    }
  };

  // Gerenciar timeout de carregamento do iframe
  useEffect(() => {
    if (playerType === "iframe") {
      setIframeLoading(true);
      // Auto-esconder spinner após 4 segundos mesmo que não tenha carregado
      iframeLoadTimeoutRef.current = setTimeout(() => {
        setIframeLoading(false);
      }, 4000);
    }

    return () => {
      if (iframeLoadTimeoutRef.current) {
        clearTimeout(iframeLoadTimeoutRef.current);
      }
    };
  }, [playerType, iframeKey]);

  // Monitorar se modal foi fechado
  useEffect(() => {
    if (!isOpen) {
      console.log("⏹️ Player modal foi fechado");
    }
  }, [isOpen]);

  // Gerenciar inatividade para esconder controles do iframe
  const handleMouseMove = () => {
    // Mostrar controles
    if (!isControlsVisible) {
      setIsControlsVisible(true);
    }
    
    // Limpar timeout anterior
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Definir novo timeout para esconder controles
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 4000); // 4 segundos de inatividade
  };

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  // Pausar auto-hide quando mouse sai do container
  const handleMouseLeave = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden group ${
          isControlsVisible ? "cursor-auto" : "cursor-none"
        }`}
      >
        {/* Mostrar player/iframe imediatamente, mesmo que ainda esteja carregando */}
        {playerType === "video" && resolvedUrl ? (
          <>
            <video
              ref={videoRef}
              title={title}
              className="w-full h-full"
              controls
              autoPlay
            />
            
            {/* Seletor de Qualidade */}
            {qualities.length > 1 && (
              <div className={`absolute bottom-16 right-4 transition-opacity duration-300 z-10 ${
                isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}>
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="flex items-center gap-1 px-3 py-2 bg-black/70 hover:bg-black/90 rounded text-white text-sm transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    {currentQuality}
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded overflow-hidden border border-white/20">
                      {qualities.map((quality) => (
                        <button
                          key={quality.label}
                          onClick={() => handleQualityChange(quality)}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                            currentQuality === quality.label
                              ? "bg-primary text-white"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          {quality.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : playerType === "iframe" && resolvedUrl ? (
          <>
            {iframeLoading && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <p className="text-white text-sm">Carregando player...</p>
                </div>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={resolvedUrl}
              title={title}
              data-src={resolvedUrl}
              className="w-full h-full border-0 relative z-30"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture; screen-wake-lock; fullscreen"
              onLoad={() => {
                console.log("✅ iframe carregado:", resolvedUrl);
                setIframeLoading(false);
                if (iframeLoadTimeoutRef.current) clearTimeout(iframeLoadTimeoutRef.current);
              }}
              onError={() => {
                console.error("❌ iframe erro ao carregar:", resolvedUrl);
                setIframeLoading(false);
              }}
            />
            
            {/* Botão para recarregar iframe (útil para MegaEmbed) */}
            <button
              onClick={() => {
                setIframeKey(prev => prev + 1);
                setIframeLoading(true);
              }}
              className={`absolute top-4 right-4 z-40 p-2 bg-black/70 hover:bg-black/90 rounded transition-all duration-200 ${
                isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              title="Recarregar player"
            >
              <RotateCw className="h-5 w-5 text-white" />
            </button>

            {/* Overlay invisível para detectar cliques e mostrar controles novamente */}
            <div
              className={`absolute inset-0 z-30 transition-opacity duration-200 ${
                !isControlsVisible ? "pointer-events-auto" : "pointer-events-none"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsControlsVisible(true);
              }}
            />
          </>
        ) : playerType === "error" || !resolvedUrl ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {loading ? (
              <p>Carregando player...</p>
            ) : (
              <div className="text-center">
                <p className="mb-2">Nenhuma URL de player cadastrada para este conteúdo.</p>
                <p className="text-sm">Formatos suportados: .mp4, .m3u8, .txt (com URLs), embeds</p>
              </div>
            )}
          </div>
        ) : null}

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={`absolute top-2 right-2 text-white hover:bg-white/20 transition-opacity duration-300 z-50 ${
            isControlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}



