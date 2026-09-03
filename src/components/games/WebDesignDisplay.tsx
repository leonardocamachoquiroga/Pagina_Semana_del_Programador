import React, { useState, useEffect } from 'react';
import { Palette, Layout, Clock, CheckCircle, Sparkles, RefreshCw, Play, Pause, RotateCcw } from 'lucide-react';
import { POSTAS, MASTER_PIN } from '../../utils/routing';
import { completarPostaEquipo, getEquipos, subscribeToChanges } from '../../utils/storage';

const TOPICS = [
  { id: 1, titulo: 'Plataforma de Tutorías UCB', desc: 'Sistema de reserva de tutores entre estudiantes con agendamiento y valoraciones.' },
  { id: 2, titulo: 'Dashboard de Hackathon 2026', desc: 'Panel en tiempo real para votaciones de jueces, tabla de posiciones y timer de entregas.' },
  { id: 3, titulo: 'Red de Proyectos Open Source', desc: 'Showcase interactivo de código creado por estudiantes con repositorios y medallas.' },
  { id: 4, titulo: 'Asistente IA para Horarios', desc: 'Interfaz conversacional y visual para optimizar la inscripción de materias.' }
];

export const WebDesignDisplay: React.FC = () => {
  const [topicIndex, setTopicIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedEquipoId, setSelectedEquipoId] = useState('');
  const [equipos, setEquipos] = useState(getEquipos());
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToChanges(() => setEquipos(getEquipos()));
    return () => unsub();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isRunning, secondsLeft]);

  const currentTopic = TOPICS[topicIndex];

  const handleValidarPosta = () => {
    if (!selectedEquipoId) {
      setErrorMsg('Selecciona un equipo de 4 dígitos');
      return;
    }
    const postaInfo = POSTAS.find((p) => p.id === 3);
    if (pinInput !== postaInfo?.pin && pinInput !== MASTER_PIN) {
      setErrorMsg('PIN de moderador incorrecto (PIN Posta 3: 1003)');
      return;
    }

    const res = completarPostaEquipo(selectedEquipoId, 3, 100, 600 - secondsLeft, `Tema: ${currentTopic.titulo}`);
    if (res) {
      setSuccessMsg(`¡Posta 3 completada con éxito para el Equipo ${selectedEquipoId}!`);
      setErrorMsg('');
      setPinInput('');
    } else {
      setErrorMsg('Error al guardar progreso');
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-purple-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                POSTA 03
              </span>
              <span className="text-xs text-slate-400 font-mono">Encargado: Juanma</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              Tema <span>Página Web</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-lg">
              Diseño conceptual, estructura de datos y propuesta de UI/UX en 10 minutos.
            </p>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center p-5 bg-slate-950/90 rounded-2xl border border-purple-500/30 shadow-xl min-w-[220px]">
            <span className="text-[10px] text-purple-400 font-mono uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Cronómetro UI
            </span>
            <span className="text-4xl font-black font-mono text-purple-300 my-1">
              {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-xs font-bold flex items-center gap-1 border border-purple-500/40"
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isRunning ? 'Pausar' : 'Iniciar'}
              </button>
              <button
                onClick={() => { setIsRunning(false); setSecondsLeft(600); }}
                className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white rounded text-xs"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Card */}
      <div className="glass-panel p-6 rounded-2xl border-purple-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Reto de Diseño Asignado:</h3>
          </div>
          <button
            onClick={() => setTopicIndex((prev) => (prev + 1) % TOPICS.length)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-purple-300 flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Cambiar Tema
          </button>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
          <h4 className="text-xl font-bold text-ucb-gold">{currentTopic.titulo}</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{currentTopic.desc}</p>
        </div>

        {/* Deliverables Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-start gap-2">
            <Layout className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">1. Layout & Hero</span>
              <span className="text-[11px] text-slate-400">Estructura visual principal</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">2. Valor Diferencial</span>
              <span className="text-[11px] text-slate-400">Funcionalidad estrella</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">3. Pitch Expreso</span>
              <span className="text-[11px] text-slate-400">Exposición breve a Juanma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Form */}
      <div className="glass-panel p-5 rounded-xl border-purple-500/20 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-purple-400" />
          Aprobación por Juanma (PIN: 1003)
        </h3>

        {errorMsg && <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded">{errorMsg}</p>}
        {successMsg && <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded">{successMsg}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedEquipoId}
            onChange={(e) => setSelectedEquipoId(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 font-mono"
          >
            <option value="">-- Seleccionar Equipo (ID 4 Dígitos) --</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                [{eq.id}] {eq.nombre}
              </option>
            ))}
          </select>

          <input
            type="password"
            placeholder="PIN (1003)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-36 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 font-mono text-center"
          />

          <button
            onClick={handleValidarPosta}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs rounded-lg hover:brightness-110 shadow-md shadow-purple-500/20"
          >
            Validar Posta 3
          </button>
        </div>
      </div>

    </div>
  );
};
