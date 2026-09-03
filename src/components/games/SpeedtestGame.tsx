import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, CheckCircle, Trophy, Code2, Clock, Sparkles } from 'lucide-react';
import { POSTAS, MASTER_PIN } from '../../utils/routing';
import { completarPostaEquipo, getEquipos, subscribeToChanges } from '../../utils/storage';

const SNIPPETS = [
  {
    id: 1,
    lenguaje: 'JavaScript',
    titulo: 'Filtro y Mapeo de Estudiantes UCB',
    code: `const estudiantes = Array.from({ length: 10 });
const aprobados = estudiantes
  .filter(std => std.nota >= 51)
  .map(std => ({ ...std, estado: 'APROBADO' }));
console.log('Total aprobados:', aprobados.length);`
  },
  {
    id: 2,
    lenguaje: 'Python',
    titulo: 'Búsqueda Binaria de Hackathon',
    code: `def busqueda_binaria(arr, x):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == x: return mid
        elif arr[mid] < x: low = mid + 1
        else: high = mid - 1
    return -1`
  },
  {
    id: 3,
    lenguaje: 'TypeScript',
    titulo: 'Algoritmo de Rutas Circulares',
    code: `interface Equipo { id: string; postaInicial: number; }
function getNextPosta(current: number): number {
    return (current % 5) + 1;
}`
  }
];

export const SpeedtestGame: React.FC = () => {
  const [selectedSnippet, setSelectedSnippet] = useState(SNIPPETS[0]);
  const [inputCode, setInputCode] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedEquipoId, setSelectedEquipoId] = useState('');
  const [equipos, setEquipos] = useState(getEquipos());
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const unsub = subscribeToChanges(() => {
      setEquipos(getEquipos());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isStarted && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isCompleted]);

  const handleStart = () => {
    setIsStarted(true);
    setIsCompleted(false);
    setInputCode('');
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setErrorMsg('');
    setSuccessMsg('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleReset = () => {
    setIsStarted(false);
    setIsCompleted(false);
    setInputCode('');
    setElapsedSeconds(0);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Cálculo de exactitud
  const targetCode = selectedSnippet.code;
  const matchChars = inputCode.split('').filter((char, idx) => char === targetCode[idx]).length;
  const accuracy = targetCode.length > 0 ? Math.round((matchChars / targetCode.length) * 100) : 0;
  const wpm = elapsedSeconds > 0 ? Math.round((inputCode.length / 5) / (elapsedSeconds / 60)) : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputCode(val);

    if (val.trim() === targetCode.trim()) {
      setIsCompleted(true);
      setSuccessMsg('¡Código escrito perfectamente! Solicita al moderador validar.');
    }
  };

  const handleValidarPosta = () => {
    if (!selectedEquipoId) {
      setErrorMsg('Selecciona un equipo de 4 dígitos');
      return;
    }
    const postaInfo = POSTAS.find((p) => p.id === 1);
    if (pinInput !== postaInfo?.pin && pinInput !== MASTER_PIN) {
      setErrorMsg('PIN de moderador incorrecto (PIN Posta 1: 1001)');
      return;
    }

    const res = completarPostaEquipo(selectedEquipoId, 1, accuracy, elapsedSeconds, `WPM: ${wpm}, Precisión: ${accuracy}%`);
    if (res) {
      setSuccessMsg(`¡Posta 1 completada con éxito para el Equipo ${selectedEquipoId}!`);
      setErrorMsg('');
      setPinInput('');
    } else {
      setErrorMsg('Error actualizando el equipo');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-cyan-500/30">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                POSTA 01
              </span>
              <span className="text-xs text-slate-400 font-mono">Encargado: Gadiel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Speedtest de <span>Código</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Transcribe el algoritmo de prueba lo más rápido posible. Minimiza errores de tipeo para maximizar puntaje.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Tiempo</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Velocidad</span>
              <span className="text-xl font-bold font-mono text-amber-400">{wpm} <span className="text-xs font-normal">WPM</span></span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Precisión</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{accuracy}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Snippet Selector & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Seleccionar Desafío:</span>
          <div className="flex gap-2">
            {SNIPPETS.map((snip) => (
              <button
                key={snip.id}
                onClick={() => {
                  setSelectedSnippet(snip);
                  handleReset();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedSnippet.id === snip.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {snip.lenguaje} - {snip.titulo}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isStarted ? (
            <button
              onClick={handleStart}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Iniciar Speedtest
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm flex items-center gap-2 border border-slate-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Target Code Panel */}
        <div className="glass-panel p-4 rounded-xl space-y-2 border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Código Objetivo ({selectedSnippet.lenguaje})
            </span>
            <span className="text-xs text-slate-500 font-mono">{targetCode.length} Caracteres</span>
          </div>
          <pre className="p-4 bg-slate-950/90 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800/80 leading-relaxed min-h-[180px]">
            {targetCode}
          </pre>
        </div>

        {/* Input Typing Panel */}
        <div className="glass-panel p-4 rounded-xl space-y-2 border-cyan-500/20">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              Escribe Aquí
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {inputCode.length} / {targetCode.length}
            </span>
          </div>

          <textarea
            ref={inputRef}
            value={inputCode}
            onChange={handleInputChange}
            disabled={!isStarted || isCompleted}
            placeholder={isStarted ? 'Comienza a escribir el código exacto...' : 'Haz clic en "Iniciar Speedtest" para comenzar el reloj'}
            rows={8}
            className="w-full p-4 bg-slate-950/90 rounded-lg text-xs font-mono text-cyan-200 placeholder-slate-600 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none leading-relaxed"
          />
        </div>

      </div>

      {/* Moderator Validation Box */}
      <div className="glass-panel p-5 rounded-xl border-amber-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ucb-gold" />
            Validación por Moderador (Gadiel)
          </h3>
          <span className="text-xs text-slate-400 font-mono">PIN Requerido</span>
        </div>

        {errorMsg && <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2 rounded border border-rose-500/20">{errorMsg}</p>}
        {successMsg && <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 p-2 rounded border border-emerald-500/20">{successMsg}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedEquipoId}
              onChange={(e) => setSelectedEquipoId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400 font-mono"
            >
              <option value="">-- Seleccionar Equipo (ID 4 Dígitos) --</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  [{eq.id}] {eq.nombre}
                </option>
              ))}
            </select>
          </div>

          <input
            type="password"
            placeholder="PIN Posta (1001)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-36 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 font-mono text-center outline-none focus:border-amber-400"
          />

          <button
            onClick={handleValidarPosta}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-ucb-gold text-slate-950 font-bold text-xs rounded-lg hover:brightness-110 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <CheckCircle className="w-4 h-4" />
            Completar Posta 1
          </button>
        </div>
      </div>

    </div>
  );
};
