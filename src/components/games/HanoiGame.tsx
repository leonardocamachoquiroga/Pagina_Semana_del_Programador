import React, { useState, useEffect } from 'react';
import { Puzzle, RotateCcw, Trophy, CheckCircle, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { POSTAS, MASTER_PIN } from '../../utils/routing';
import { completarPostaEquipo, getEquipos, subscribeToChanges } from '../../utils/storage';

export const HanoiGame: React.FC = () => {
  const [numDisks, setNumDisks] = useState(3);
  const [pegs, setPegs] = useState<number[][]>([[3, 2, 1], [], []]);
  const [selectedPegIndex, setSelectedPegIndex] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [selectedEquipoId, setSelectedEquipoId] = useState('');
  const [equipos, setEquipos] = useState(getEquipos());
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToChanges(() => setEquipos(getEquipos()));
    return () => unsub();
  }, []);

  // Timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTimerRunning && !isWon) {
      timer = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isTimerRunning, isWon]);

  const initGame = (disks: number) => {
    setNumDisks(disks);
    const initialPeg = Array.from({ length: disks }, (_, i) => disks - i);
    setPegs([initialPeg, [], []]);
    setSelectedPegIndex(null);
    setMoveCount(0);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setIsWon(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handlePegClick = (pegIdx: number) => {
    if (isWon) return;

    if (!isTimerRunning && moveCount === 0) {
      setIsTimerRunning(true);
    }

    if (selectedPegIndex === null) {
      // Seleccionar peg si no está vacío
      if (pegs[pegIdx].length > 0) {
        setSelectedPegIndex(pegIdx);
      }
    } else {
      // Intentar mover de selectedPegIndex a pegIdx
      if (selectedPegIndex === pegIdx) {
        setSelectedPegIndex(null);
        return;
      }

      const sourcePeg = [...pegs[selectedPegIndex]];
      const targetPeg = [...pegs[pegIdx]];
      const diskToMove = sourcePeg[sourcePeg.length - 1];
      const topTargetDisk = targetPeg.length > 0 ? targetPeg[targetPeg.length - 1] : Infinity;

      if (diskToMove < topTargetDisk) {
        // Movimiento válido
        sourcePeg.pop();
        targetPeg.push(diskToMove);

        const newPegs = [...pegs];
        newPegs[selectedPegIndex] = sourcePeg;
        newPegs[pegIdx] = targetPeg;

        setPegs(newPegs);
        setMoveCount((prev) => prev + 1);
        setSelectedPegIndex(null);

        // Comprobar victoria (todos los discos en Poste B o Poste C)
        if (targetPeg.length === numDisks && pegIdx !== 0) {
          setIsWon(true);
          setIsTimerRunning(false);
          setSuccessMsg(`¡Puzzle resuelto en ${moveCount + 1} movimientos! Solicita la clave a Adro.`);
        }
      } else {
        // Movimiento inválido
        setErrorMsg('¡Movimiento no permitido! No se puede poner un disco mayor sobre uno menor.');
        setTimeout(() => setErrorMsg(''), 3000);
        setSelectedPegIndex(null);
      }
    }
  };

  const handleValidarPosta = () => {
    if (!selectedEquipoId) {
      setErrorMsg('Selecciona un equipo de 4 dígitos');
      return;
    }
    const postaInfo = POSTAS.find((p) => p.id === 5);
    if (pinInput !== postaInfo?.pin && pinInput !== MASTER_PIN) {
      setErrorMsg('PIN de moderador incorrecto (PIN Posta 5: 1005)');
      return;
    }

    const res = completarPostaEquipo(selectedEquipoId, 5, 100, elapsedSeconds, `Hanoi ${numDisks} discos en ${moveCount} movs`);
    if (res) {
      setSuccessMsg(`¡Posta 5 completada con éxito para el Equipo ${selectedEquipoId}!`);
      setErrorMsg('');
      setPinInput('');
    } else {
      setErrorMsg('Error al guardar progreso');
    }
  };

  const minMoves = Math.pow(2, numDisks) - 1;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-emerald-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                POSTA 05
              </span>
              <span className="text-xs text-slate-400 font-mono">Encargado: Adro</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              Juegos Lógicos <span>(Torre de Hanoi)</span>
            </h2>
            <p className="text-sm text-slate-300">
              Desplaza la torre de discos hacia otro poste respetando las reglas de tamaño.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Movimientos</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {moveCount} <span className="text-xs text-slate-500">/ Mín {minMoves}</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Tiempo</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disks Selector & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Dificultad (Discos):</span>
          {[3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => initGame(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                numDisks === d
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {d} Discos
            </button>
          ))}
        </div>

        <button
          onClick={() => initGame(numDisks)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg flex items-center gap-1.5 border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Torre
        </button>
      </div>

      {/* Interactive Hanoi Canvas Pegs */}
      <div className="glass-panel p-8 rounded-2xl border-emerald-500/20 space-y-6">
        
        {isWon && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center space-y-1 animate-bounce">
            <Trophy className="w-8 h-8 text-ucb-gold mx-auto" />
            <h3 className="text-lg font-bold text-emerald-300">¡FELICIDADES! ¡TORRE COMPLETADA!</h3>
            <p className="text-xs text-slate-200">Logrado en {moveCount} movimientos y {elapsedSeconds} segundos.</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 h-64 items-end relative pt-10">
          
          {pegs.map((peg, pegIdx) => {
            const isSelected = selectedPegIndex === pegIdx;
            
            return (
              <div
                key={pegIdx}
                onClick={() => handlePegClick(pegIdx)}
                className={`relative h-full flex flex-col justify-end items-center rounded-xl p-2 cursor-pointer transition-all ${
                  isSelected ? 'bg-emerald-500/10 border-2 border-emerald-400/80 shadow-lg shadow-emerald-500/20' : 'bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800'
                }`}
              >
                {/* Vertical Wooden Pole */}
                <div className="absolute bottom-4 w-3 bg-slate-700 rounded-t-md h-44 shadow-inner pointer-events-none -z-0"></div>
                
                {/* Base Platform */}
                <div className="w-full h-4 bg-slate-800 rounded-lg z-10 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Poste {String.fromCharCode(65 + pegIdx)}
                  </span>
                </div>

                {/* Disks stacked bottom-up */}
                <div className="w-full flex flex-col-reverse items-center gap-1 z-10 mb-4 pointer-events-none">
                  {peg.map((diskSize) => {
                    const widthPercent = 35 + (diskSize / numDisks) * 60;
                    const colors = [
                      'bg-emerald-400 shadow-emerald-400/50',
                      'bg-cyan-400 shadow-cyan-400/50',
                      'bg-amber-400 shadow-amber-400/50',
                      'bg-purple-400 shadow-purple-400/50',
                      'bg-rose-400 shadow-rose-400/50'
                    ];
                    const diskColor = colors[(diskSize - 1) % colors.length];

                    return (
                      <div
                        key={diskSize}
                        style={{ width: `${widthPercent}%` }}
                        className={`h-7 rounded-lg ${diskColor} shadow-md flex items-center justify-center font-bold text-slate-950 text-xs font-mono border border-white/20 transition-all`}
                      >
                        {diskSize}
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}

        </div>
        <p className="text-center text-xs text-slate-400 font-mono">
          {selectedPegIndex === null ? 'Haz clic en un poste para tomar el disco superior' : `Disco tomado del Poste ${String.fromCharCode(65 + selectedPegIndex)}. Haz clic en el poste destino.`}
        </p>
      </div>

      {/* Moderator Form */}
      <div className="glass-panel p-5 rounded-xl border-emerald-500/20 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Aprobación por Adro (PIN: 1005)
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
            placeholder="PIN (1005)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-36 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 font-mono text-center"
          />

          <button
            onClick={handleValidarPosta}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-lg hover:brightness-110 shadow-md shadow-emerald-500/20"
          >
            Validar Posta 5
          </button>
        </div>
      </div>

    </div>
  );
};
