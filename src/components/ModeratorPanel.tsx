import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Unlock, Plus, RefreshCw, CheckCircle2, Circle, AlertCircle, Trash2, KeyRound } from 'lucide-react';
import { POSTAS, MASTER_PIN, getSiguientePosta, getPostasCompletadasCount } from '../utils/routing';
import { getEquipos, completarPostaEquipo, resetearEquipo, resetearTodoElEvento, registrarOCrearEquipo, subscribeToChanges } from '../utils/storage';
import type { Equipo, PostaId } from '../types/game';

export const ModeratorPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [equipos, setEquipos] = useState<Equipo[]>(getEquipos());
  const [searchId, setSearchId] = useState('');
  const [nuevoEquipoId, setNuevoEquipoId] = useState('');
  const [nuevoEquipoNombre, setNuevoEquipoNombre] = useState('');
  const [selectedEquipoId, setSelectedEquipoId] = useState('');
  const [selectedPostaId, setSelectedPostaId] = useState<PostaId>(1);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToChanges(() => {
      setEquipos(getEquipos());
    });
    return () => unsub();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPin === MASTER_PIN || POSTAS.some((p) => p.pin === authPin)) {
      setIsAuthenticated(true);
      setStatusMsg(null);
    } else {
      setStatusMsg({ type: 'error', text: 'PIN de acceso incorrecto. Usa ADMIN2026 o el PIN de tu posta.' });
    }
  };

  const handleCrearEquipo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEquipoId || nuevoEquipoId.length !== 4 || !/^\d{4}$/.test(nuevoEquipoId)) {
      setStatusMsg({ type: 'error', text: 'El ID del equipo debe ser un número de 4 dígitos (ej: 1462, 6462)' });
      return;
    }

    const eq = registrarOCrearEquipo(nuevoEquipoId, nuevoEquipoNombre || `Equipo ${nuevoEquipoId}`);
    setNuevoEquipoId('');
    setNuevoEquipoNombre('');
    setStatusMsg({ type: 'success', text: `Equipo [${eq.id}] registrado exitosamente.` });
  };

  const handleAprobarPosta = (equipoId: string, postaId: PostaId) => {
    const res = completarPostaEquipo(equipoId, postaId, 100, 0, 'Aprobado manualmente desde Panel Moderador');
    if (res) {
      setStatusMsg({ type: 'success', text: `Posta ${postaId} marcada como completada para el Equipo ${equipoId}` });
    }
  };

  const handleResetEquipo = (equipoId: string) => {
    if (confirm(`¿Estás seguro de reiniciar el progreso del equipo ${equipoId}?`)) {
      resetearEquipo(equipoId);
      setStatusMsg({ type: 'success', text: `Progreso del equipo ${equipoId} reiniciado.` });
    }
  };

  const handleResetAll = () => {
    if (confirm('⚠️ ATENCIÓN: ¿Deseas reiniciar TODOS los datos de la competencia?')) {
      resetearTodoElEvento();
      setStatusMsg({ type: 'success', text: 'Todos los datos del evento han sido reiniciados.' });
    }
  };

  const filteredEquipos = equipos.filter((eq) =>
    eq.id.includes(searchId) || eq.nombre.toLowerCase().includes(searchId.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 mt-12">
        <div className="glass-panel p-8 rounded-2xl border-emerald-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <Lock className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-2xl font-extrabold text-white">Panel de Moderador</h2>
            <p className="text-xs text-slate-400 mt-1">Ingresa el PIN de tu posta o el Master PIN para acceder.</p>
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-lg text-xs font-medium ${statusMsg.type === 'error' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-300'}`}>
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Ingresar PIN (ej. ADMIN2026)"
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-mono text-white tracking-widest outline-none focus:border-emerald-400"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Desbloquear Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              MODERACIÓN ACTIVA
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Control de <span>Postas y Equipos</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAll}
            className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-500/30 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Resetear Todo
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1 border border-slate-700"
          >
            <Unlock className="w-4 h-4" /> Salir
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold ${statusMsg.type === 'error' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Quick Register Team & Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Register 4-digit Team */}
        <div className="glass-panel p-5 rounded-xl space-y-3 border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> Registrar Nuevo Equipo (ID 4 Dígitos)
          </h3>
          <form onSubmit={handleCrearEquipo} className="flex gap-2">
            <input
              type="text"
              placeholder="ID (ej: 1462)"
              maxLength={4}
              value={nuevoEquipoId}
              onChange={(e) => setNuevoEquipoId(e.target.value)}
              className="w-28 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-center text-white outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              placeholder="Nombre Opcional (ej: Cyber-Devs)"
              value={nuevoEquipoNombre}
              onChange={(e) => setNuevoEquipoNombre(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
            >
              Registrar
            </button>
          </form>
        </div>

        {/* Quick Approve Action */}
        <div className="glass-panel p-5 rounded-xl space-y-3 border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-ucb-gold" /> Validación Rápida de Posta
          </h3>
          <div className="flex gap-2">
            <select
              value={selectedEquipoId}
              onChange={(e) => setSelectedEquipoId(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white outline-none"
            >
              <option value="">-- Seleccionar Equipo --</option>
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.id}] {e.nombre}
                </option>
              ))}
            </select>

            <select
              value={selectedPostaId}
              onChange={(e) => setSelectedPostaId(Number(e.target.value) as PostaId)}
              className="w-32 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white outline-none"
            >
              {POSTAS.map((p) => (
                <option key={p.id} value={p.id}>
                  Posta {p.id}
                </option>
              ))}
            </select>

            <button
              onClick={() => selectedEquipoId && handleAprobarPosta(selectedEquipoId, selectedPostaId)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-ucb-gold text-slate-950 font-bold text-xs rounded-lg hover:brightness-110 transition-all"
            >
              Marcar OK
            </button>
          </div>
        </div>

      </div>

      {/* Teams Progress Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Lista de Equipos Competidores</span>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
              {equipos.length} Equipos Total
            </span>
          </h3>

          <input
            type="text"
            placeholder="Buscar por ID de 4 dígitos o nombre..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="p-3">ID 4 Dígitos</th>
                <th className="p-3">Nombre Equipo</th>
                <th className="p-3">Siguiente Misión</th>
                <th className="p-3 text-center">Progreso</th>
                <th className="p-3 text-center">Postas (1 a 5)</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEquipos.map((eq) => {
                const count = getPostasCompletadasCount(eq);
                const siguiente = getSiguientePosta(eq);

                return (
                  <tr key={eq.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-ucb-gold text-sm">
                      {eq.id}
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {eq.nombre}
                    </td>
                    <td className="p-3">
                      {siguiente ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          Posta {siguiente.id}: {siguiente.titulo}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          🎉 100% COMPLETADO
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-mono font-bold text-white">{count} / 5</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {POSTAS.map((p) => {
                          const isDone = eq.progresos[p.id]?.estado === 'completado';
                          return (
                            <button
                              key={p.id}
                              title={`Posta ${p.id} - ${p.titulo} (${isDone ? 'Completado' : 'Pendiente'})`}
                              onClick={() => handleAprobarPosta(eq.id, p.id)}
                              className={`w-7 h-7 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white border border-slate-700'
                              }`}
                            >
                              P{p.id}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleResetEquipo(eq.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Reset
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
