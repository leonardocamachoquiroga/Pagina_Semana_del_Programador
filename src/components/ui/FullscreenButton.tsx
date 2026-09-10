import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const supported = typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen);
    setIsSupported(supported);

    if (!supported) return undefined;

    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('astro:after-swap', handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('astro:after-swap', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!isSupported) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // El navegador puede rechazar fullscreen si la llamada no proviene de una interacción directa.
    }
  };

  return (
    <button
      type="button"
      className="control-button control-button--compact"
      onClick={toggleFullscreen}
      disabled={!isSupported}
      aria-pressed={isFullscreen}
      title={isSupported ? (isFullscreen ? 'Salir de pantalla completa' : 'Abrir pantalla completa') : 'Pantalla completa no disponible'}
    >
      {isFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
      <span>{isFullscreen ? 'Salir' : 'Pantalla completa'}</span>
    </button>
  );
};
