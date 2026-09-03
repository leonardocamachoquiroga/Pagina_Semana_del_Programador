import React, { useState, useEffect } from 'react';
import { SpeedtestGame } from './games/SpeedtestGame';
import { WendoDisplay } from './games/WendoDisplay';
import { WebDesignDisplay } from './games/WebDesignDisplay';
import { BugHuntGame } from './games/BugHuntGame';
import { HanoiGame } from './games/HanoiGame';
import { POSTAS } from '../utils/routing';
import type { PostaId } from '../types/game';
import { Tv, Monitor, ChevronRight } from 'lucide-react';

interface TVRouterProps {
  initialPostaId?: PostaId;
}

export const TVRouter: React.FC<TVRouterProps> = ({ initialPostaId }) => {
  const [activePostaId, setActivePostaId] = useState<PostaId | null>(initialPostaId || null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qp = urlParams.get('posta');
      if (qp && [1, 2, 3, 4, 5].includes(Number(qp))) {
        setActivePostaId(Number(qp) as PostaId);
      }
    }
  }, []);

  if (!activePostaId) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border-amber-500/30 text-center space-y-3">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/40">
            <Tv className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Hub de Estaciones para Pantallas TV</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Selecciona cuál estación interactiva deseas proyectar en el monitor de este televisor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTAS.map((posta) => (
            <div
              key={posta.id}
              onClick={() => setActivePostaId(posta.id)}
              className="glass-panel p-6 rounded-2xl border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all space-y-4 group card-numbered"
              data-number={`0${posta.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                  POSTA 0{posta.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">Encargado: {posta.encargado}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {posta.titulo}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{posta.descripcion}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs text-amber-400 font-semibold">
                <span>Cargar Interfaz TV</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Floating Selector Bar */}
      <div className="glass-panel py-2 px-4 max-w-4xl mx-auto rounded-full border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">TV Estación:</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {POSTAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePostaId(p.id)}
              className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all ${
                activePostaId === p.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              P{p.id}: {p.encargado}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActivePostaId(null)}
          className="text-slate-400 hover:text-white font-mono text-[11px]"
        >
          [Cambiar]
        </button>
      </div>

      {/* Render Selected Game */}
      {activePostaId === 1 && <SpeedtestGame />}
      {activePostaId === 2 && <WendoDisplay />}
      {activePostaId === 3 && <WebDesignDisplay />}
      {activePostaId === 4 && <BugHuntGame />}
      {activePostaId === 5 && <HanoiGame />}
    </div>
  );
};
