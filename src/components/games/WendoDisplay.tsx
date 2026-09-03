import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle, Flame, Shield, Award, Play, Pause, RotateCcw } from 'lucide-react';
import { POSTAS, MASTER_PIN } from '../../utils/routing';
import { completarPostaEquipo, getEquipos, subscribeToChanges } from '../../utils/storage';

export const WendoDisplay: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutos
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
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft]);

  const handleValidarPosta = () => {
    if (!selectedEquipoId) {
      setErrorMsg('Selecciona un equipo de 4 dígitos');
      return;
    }
    const postaInfo = POSTAS.find((p) => p.id === 2);
    if (pinInput !== postaInfo?.pin && pinInput !== MASTER_PIN) {
      setErrorMsg('PIN de moderador incorrecto (PIN Posta 2: 1002)');
      return;
    }

    const res = completarPostaEquipo(selectedEquipoId, 2, 100, 600 - secondsLeft, 'Reto físico Wendo completado');
    if (res) {
      setSuccessMsg(`¡Posta 2 completada con éxito para el Equipo ${selectedEquipoId}!`);
      setErrorMsg('');
      setPinInput('');
    } else {
      setErrorMsg('Error al guardar progreso');
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Main Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-amber-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                POSTA 02
              </span>
              <span className="text-xs text-slate-400 font-mono">Encargada: Carla</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              Bloques de <span>Wendo</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-lg">
              Desafío de coordinación física y resolución lógica tridimensional con bloques.
            </p>
          </div>

          {/* Large Countdown Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/90 rounded-2xl border border-amber-500/30 shadow-xl min-w-[240px]">
            <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" /> Tiempo Restante
            </span>
            <span className={`text-5xl font-black font-mono my-1 tracking-tight ${secondsLeft < 120 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
              {minutes.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-xs font-bold flex items-center gap-1 border border-amber-500/40"
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

      {/* Instructions & Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl space-y-2 border-slate-800 card-numbered" data-number="01">
          <Flame className="w-6 h-6 text-amber-400" />
          <h3 className="text-base font-bold text-white">Objetivo del Reto</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ensamblar la figura Wendo asignada por Carla utilizando todos los bloques físicos de la estación.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl space-y-2 border-slate-800 card-numbered" data-number="02">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Reglas de Trabajo</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Todos los integrantes del equipo deben aportar en el ensamble. No se permite desarmar estructuras previas completas.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl space-y-2 border-slate-800 card-numbered" data-number="03">
          <Award className="w-6 h-6 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Validación</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Al terminar la construcción, Carla inspeccionará la estabilidad y otorgará el código de aprobación.
          </p>
        </div>
      </div>

      {/* Moderator Form */}
      <div className="glass-panel p-5 rounded-xl border-amber-500/20 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-amber-400" />
          Aprobación por Carla (PIN: 1002)
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
            placeholder="PIN (1002)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-36 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 font-mono text-center"
          />

          <button
            onClick={handleValidarPosta}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-ucb-gold text-slate-950 font-bold text-xs rounded-lg hover:brightness-110 shadow-md shadow-amber-500/20"
          >
            Validar Posta 2
          </button>
        </div>
      </div>

    </div>
  );
};
