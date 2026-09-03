import React, { useState, useEffect } from 'react';
import { Bug, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Play, RotateCcw, Clock } from 'lucide-react';
import { POSTAS, MASTER_PIN } from '../../utils/routing';
import { completarPostaEquipo, getEquipos, subscribeToChanges } from '../../utils/storage';

interface CodeBugChallenge {
  id: number;
  titulo: string;
  lenguaje: string;
  lines: { lineNum: number; code: string; isBug: boolean; explanation?: string }[];
}

const BUG_CHALLENGES: CodeBugChallenge[] = [
  {
    id: 1,
    titulo: 'Bucle Infinito en Servidor de Notas',
    lenguaje: 'JavaScript',
    lines: [
      { lineNum: 1, code: 'function calcularPromedio(notas) {', isBug: false },
      { lineNum: 2, code: '  let total = 0;', isBug: false },
      { lineNum: 3, code: '  for (let i = 0; i <= notas.length; i++) {', isBug: true, explanation: 'Off-by-one bug: i <= notas.length accede a un índice undefined' },
      { lineNum: 4, code: '    total += notas[i];', isBug: false },
      { lineNum: 5, code: '  }', isBug: false },
      { lineNum: 6, code: '  return total / notas.length;', isBug: false },
      { lineNum: 7, code: '}', isBug: false }
    ]
  },
  {
    id: 2,
    titulo: 'Fuga de Memoria & Null Pointer en C++',
    lenguaje: 'C++',
    lines: [
      { lineNum: 1, code: '#include <iostream>', isBug: false },
      { lineNum: 2, code: 'int* crearArreglo() {', isBug: false },
      { lineNum: 3, code: '  int arr[5] = {10, 20, 30, 40, 50};', isBug: false },
      { lineNum: 4, code: '  return arr;', isBug: true, explanation: 'Retorna puntero a una variable local de stack destruida al salir' },
      { lineNum: 5, code: '}', isBug: false },
      { lineNum: 6, code: 'int main() { int* p = crearArreglo(); std::cout << p[0]; }', isBug: false }
    ]
  },
  {
    id: 3,
    titulo: 'Inmutabilidad de Estado en React',
    lenguaje: 'TypeScript',
    lines: [
      { lineNum: 1, code: 'const [items, setItems] = useState<string[]>([]);', isBug: false },
      { lineNum: 2, code: 'function agregarItem(nuevo: string) {', isBug: false },
      { lineNum: 3, code: '  items.push(nuevo);', isBug: true, explanation: 'Mutación directa del arreglo de estado sin disparar re-render' },
      { lineNum: 4, code: '  setItems(items);', isBug: true, explanation: 'Misma referencia de arreglo pasada a setItems' },
      { lineNum: 5, code: '}', isBug: false }
    ]
  }
];

export const BugHuntGame: React.FC = () => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedEquipoId, setSelectedEquipoId] = useState('');
  const [equipos, setEquipos] = useState(getEquipos());
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToChanges(() => setEquipos(getEquipos()));
    return () => unsub();
  }, []);

  const challenge = BUG_CHALLENGES[currentChallengeIndex];

  const toggleLine = (lineNum: number) => {
    if (isEvaluated) return;
    setSelectedLines((prev) =>
      prev.includes(lineNum) ? prev.filter((l) => l !== lineNum) : [...prev, lineNum]
    );
  };

  const handleEvaluate = () => {
    setIsEvaluated(true);
    const bugLines = challenge.lines.filter((l) => l.isBug).map((l) => l.lineNum);
    
    const correctSelects = selectedLines.filter((l) => bugLines.includes(l)).length;
    const incorrectSelects = selectedLines.filter((l) => !bugLines.includes(l)).length;
    
    let calculated = Math.max(0, (correctSelects / bugLines.length) * 100 - incorrectSelects * 25);
    setScore(Math.round(calculated));
  };

  const handleReset = () => {
    setSelectedLines([]);
    setIsEvaluated(false);
    setScore(0);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleValidarPosta = () => {
    if (!selectedEquipoId) {
      setErrorMsg('Selecciona un equipo de 4 dígitos');
      return;
    }
    const postaInfo = POSTAS.find((p) => p.id === 4);
    if (pinInput !== postaInfo?.pin && pinInput !== MASTER_PIN) {
      setErrorMsg('PIN de moderador incorrecto (PIN Posta 4: 1004)');
      return;
    }

    const res = completarPostaEquipo(selectedEquipoId, 4, score || 100, 300, `Bugs encontrados en: ${challenge.titulo}`);
    if (res) {
      setSuccessMsg(`¡Posta 4 completada con éxito para el Equipo ${selectedEquipoId}!`);
      setErrorMsg('');
      setPinInput('');
    } else {
      setErrorMsg('Error al guardar progreso');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-rose-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                POSTA 04
              </span>
              <span className="text-xs text-slate-400 font-mono">Encargado: Saul</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              Encuentra el <span>Error (Bug Hunt)</span>
            </h2>
            <p className="text-sm text-slate-300">
              Haz clic en las líneas de código que contengan bugs lógicos o de sintaxis.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <Bug className="w-6 h-6 text-rose-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Puntaje Bug Hunt</span>
              <span className="text-2xl font-bold font-mono text-rose-300">{score} / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Caso de Prueba:</span>
          {BUG_CHALLENGES.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => {
                setCurrentChallengeIndex(idx);
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentChallengeIndex === idx
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              #{ch.id} {ch.lenguaje}
            </button>
          ))}
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg flex items-center gap-1.5 border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Limpiar Selección
        </button>
      </div>

      {/* Code Snippet Lines Clickable */}
      <div className="glass-panel p-4 rounded-2xl border-rose-500/20 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            {challenge.titulo} ({challenge.lenguaje})
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Líneas seleccionadas: {selectedLines.length}
          </span>
        </div>

        <div className="bg-slate-950/90 rounded-xl p-2 border border-slate-800 space-y-1 font-mono text-xs">
          {challenge.lines.map((line) => {
            const isSelected = selectedLines.includes(line.lineNum);
            let lineBg = 'hover:bg-slate-900/80 text-slate-300';

            if (isEvaluated) {
              if (line.isBug && isSelected) {
                lineBg = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
              } else if (line.isBug && !isSelected) {
                lineBg = 'bg-amber-500/20 border-amber-500/40 text-amber-300';
              } else if (!line.isBug && isSelected) {
                lineBg = 'bg-rose-500/20 border-rose-500/40 text-rose-300';
              }
            } else if (isSelected) {
              lineBg = 'bg-rose-500/20 border-rose-500/40 text-rose-200';
            }

            return (
              <div
                key={line.lineNum}
                onClick={() => toggleLine(line.lineNum)}
                className={`p-2.5 rounded-lg border border-transparent cursor-pointer transition-colors flex items-start gap-3 ${lineBg}`}
              >
                <span className="w-6 text-right text-slate-500 select-none font-mono shrink-0">
                  {line.lineNum}
                </span>
                <span className="flex-1 overflow-x-auto whitespace-pre">{line.code}</span>
                {isEvaluated && line.isBug && (
                  <span className="text-[11px] font-sans text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                    🐛 {line.explanation}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {!isEvaluated ? (
          <button
            onClick={handleEvaluate}
            className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Bug className="w-4 h-4" /> Validar Selección de Bugs
          </button>
        ) : (
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-xs font-bold text-slate-200">
              Evaluación completada. Puntaje obtenido: {score}/100.
            </span>
          </div>
        )}
      </div>

      {/* Moderator Form */}
      <div className="glass-panel p-5 rounded-xl border-rose-500/20 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          Aprobación por Saul (PIN: 1004)
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
            placeholder="PIN (1004)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-36 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 font-mono text-center"
          />

          <button
            onClick={handleValidarPosta}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs rounded-lg hover:brightness-110 shadow-md shadow-rose-500/20"
          >
            Validar Posta 4
          </button>
        </div>
      </div>

    </div>
  );
};
