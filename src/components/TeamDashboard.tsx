import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, CheckCircle2, Clock, ChevronRight, Search, Trophy, Compass } from 'lucide-react';
import { getEquipos, registrarOCrearEquipo, subscribeToChanges } from '../utils/storage';
import { getSiguientePosta, getPostasCompletadasCount, esEquipoCompletado, getSecuenciaPostas, POSTAS } from '../utils/routing';
import type { Equipo } from '../types/game';

interface TeamDashboardProps {
  initialId?: string;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ initialId }) => {
  const [equipos, setEquipos] = useState<Equipo[]>(getEquipos());
  const [selectedId, setSelectedId] = useState(initialId || '');
  const [inputSearch, setInputSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToChanges(() => setEquipos(getEquipos()));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (initialId) {
      setSelectedId(initialId);
    } else if (equipos.length > 0 && !selectedId) {
      setSelectedId(equipos[0].id);
    }
  }, [initialId, equipos]);

  const equipoActual = equipos.find((e) => e.id === selectedId);

  const handleSearchOrJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputSearch.trim();
    if (!cleanId || cleanId.length !== 4 || !/^\d{4}$/.test(cleanId)) {
      setErrorMsg('Por favor ingresa tu ID de equipo de 4 dígitos (ej: 1462, 6462)');
      return;
    }

    const eq = registrarOCrearEquipo(cleanId);
    setSelectedId(eq.id);
    setInputSearch('');
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Team ID Input & Selector */}
      <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              PORTAL MÓVIL DE COMPETIDORES
            </span>
            <h2 className="text-xl font-extrabold text-white">
              Panel de Estado de <span>Equipo</span>
            </h2>
          </div>

          {/* Selector dropdown */}
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-white outline-none focus:border-cyan-400"
          >
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                [{e.id}] {e.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Search / Register 4-digit code form */}
        <form onSubmit={handleSearchOrJoin} className="flex gap-2 pt-2 border-t border-slate-800/60">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ingresa tu ID de 4 dígitos (ej. 1462)..."
              maxLength={4}
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-4 h-4" /> Ingresar / Buscar
          </button>
        </form>
        {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}
      </div>

      {equipoActual ? (
        <div className="space-y-6">
          
          {/* Main Active Mission Banner ("Next Step") */}
          {(() => {
            const siguiente = getSiguientePosta(equipoActual);
            const completadas = getPostasCompletadasCount(equipoActual);
            const isFinished = esEquipoCompletado(equipoActual);

            if (isFinished) {
              return (
                <div className="glass-panel-glow p-8 rounded-3xl border-emerald-500/50 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/40 text-3xl">
                    🎉
                  </div>
                  <h3 className="text-2xl font-black text-white">¡FELICITACIONES EQUIPO {equipoActual.id}!</h3>
                  <p className="text-sm text-emerald-300 font-medium max-w-md mx-auto">
                    Has completado con éxito las 5 postas del evento Vibecodear. Dirígete a la estación de la Ruleta para el gran sorteo.
                  </p>
                  <a
                    href="/ruleta"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-ucb-gold text-slate-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <Trophy className="w-5 h-5" /> Ir a la Ruleta de Premios
                  </a>
                </div>
              );
            }

            return (
              <div className="glass-panel p-6 rounded-3xl border-cyan-500/40 relative overflow-hidden space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 animate-spin" /> MISIÓN ACTUAL ("NEXT STEP")
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    Progreso: {completadas}/5 Postas ({completadas * 20}%)
                  </span>
                </div>

                <div className="p-5 bg-slate-950/80 rounded-2xl border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                      ESTACIÓN DE DESTINO: POSTA 0{siguiente?.id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Encargado: {siguiente?.encargado}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{siguiente?.titulo}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{siguiente?.descripcion}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-400 via-blue-500 to-ucb-gold h-full rounded-full transition-all duration-500"
                      style={{ width: `${(completadas / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Sequence & Stations Map */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ucb-gold" />
              Secuencia de Postas Asignada (Ruta Circular)
            </h3>

            <div className="space-y-3">
              {getSecuenciaPostas(equipoActual.postaInicial).map((postaId, index) => {
                const posta = POSTAS.find((p) => p.id === postaId)!;
                const progreso = equipoActual.progresos[postaId];
                const isCompleted = progreso?.estado === 'completado';
                const siguiente = getSiguientePosta(equipoActual);
                const isCurrent = siguiente?.id === postaId;

                return (
                  <div
                    key={postaId}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 card-numbered ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                        : isCurrent
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400'
                    }`}
                    data-number={`0${index + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl font-mono font-bold text-sm flex items-center justify-center ${
                        isCompleted ? 'bg-emerald-500 text-slate-950' : isCurrent ? 'bg-cyan-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}>
                        P{posta.id}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{posta.titulo}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({posta.encargado})</span>
                        </div>
                        <p className="text-xs text-slate-400">{posta.descripcion}</p>
                      </div>
                    </div>

                    <div>
                      {isCompleted ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completado
                        </span>
                      ) : isCurrent ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Misión Activa
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-500 border border-slate-700">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-2">
          <p className="text-sm text-slate-400">No se encontró ningún equipo seleccionado.</p>
        </div>
      )}

    </div>
  );
};
