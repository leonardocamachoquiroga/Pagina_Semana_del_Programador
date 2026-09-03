import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Gift, Sparkles, Volume2, VolumeX, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { getEquipos, getPremios, registrarGanador, getSorteos, subscribeToChanges } from '../utils/storage';
import { esEquipoCompletado } from '../utils/routing';
import type { Equipo, Premio, SorteoResultado } from '../types/game';

export const PrizeRoulette: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>(getEquipos());
  const [premios, setPremios] = useState<Premio[]>(getPremios());
  const [sorteos, setSorteos] = useState<SorteoResultado[]>(getSorteos());
  const [modoDemo, setModoDemo] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPremio, setSelectedPremio] = useState<Premio | null>(null);
  const [winnerModal, setWinnerModal] = useState<{ equipo: Equipo; premio: Premio } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef(0);
  const spinSpeedRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const unsub = subscribeToChanges(() => {
      setEquipos(getEquipos());
      setPremios(getPremios());
      setSorteos(getSorteos());
    });
    return () => unsub();
  }, []);

  // Filter 100% completed teams
  const eligibleEquipos = modoDemo
    ? equipos
    : equipos.filter((eq) => esEquipoCompletado(eq));

  useEffect(() => {
    if (premios.length > 0 && !selectedPremio) {
      setSelectedPremio(premios[0]);
    }
  }, [premios]);

  // Web Audio Synthetic Sound Tick
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback
    }
  };

  // Draw Roulette Canvas Wheel
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    const items = eligibleEquipos.length > 0 ? eligibleEquipos : [{ id: '0000', nombre: 'Esperando Equipos...' } as Equipo];
    const numSegments = items.length;
    const segmentAngle = (2 * Math.PI) / numSegments;

    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', 
      '#06b6d4', '#f97316', '#a855f7', '#14b8a6', '#eab308'
    ];

    // Segments
    for (let i = 0; i < numSegments; i++) {
      const startAngle = angle + i * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Text Label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Outfit, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      const label = items[i].id !== '0000' ? `[${items[i].id}] ${items[i].nombre.slice(0, 14)}` : items[i].nombre;
      ctx.fillText(label, radius - 25, 5);
      ctx.restore();
    }

    // Outer Neon Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FFC72C';
    ctx.stroke();

    // Center Gold Pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#002B49';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFC72C';
    ctx.stroke();

    ctx.fillStyle = '#FFC72C';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('UCB', centerX, centerY);

    // Top Pointer Arrow
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY - radius - 10);
    ctx.lineTo(centerX + 15, centerY - radius - 10);
    ctx.lineTo(centerX, centerY - radius + 15);
    ctx.closePath();
    ctx.fillStyle = '#FFC72C';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [eligibleEquipos, modoDemo]);

  const handleSpin = () => {
    if (isSpinning || eligibleEquipos.length === 0 || !selectedPremio) return;

    setIsSpinning(true);
    const totalDurationMs = 5000 + Math.random() * 2000;
    const startTime = performance.now();
    const initialSpeed = 0.3 + Math.random() * 0.2;
    let lastSegmentIdx = -1;

    const numSegments = eligibleEquipos.length;
    const segmentAngle = (2 * Math.PI) / numSegments;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDurationMs);

      // Ease out cubic friction
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentSpeed = initialSpeed * (1 - easeOut);

      currentAngleRef.current = (currentAngleRef.current + currentSpeed) % (2 * Math.PI);
      drawWheel(currentAngleRef.current);

      // Calculate current segment passing top pointer
      const pointerAngle = (3 * Math.PI) / 2; // Top
      let normalizedAngle = (pointerAngle - currentAngleRef.current) % (2 * Math.PI);
      if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

      const currentSegmentIdx = Math.floor(normalizedAngle / segmentAngle) % numSegments;

      if (currentSegmentIdx !== lastSegmentIdx) {
        lastSegmentIdx = currentSegmentIdx;
        playTickSound();
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningTeam = eligibleEquipos[currentSegmentIdx];
        
        // Register winner & Trigger Confetti
        registrarGanador(winningTeam.id, winningTeam.nombre, selectedPremio.nombre);
        setWinnerModal({ equipo: winningTeam, premio: selectedPremio });
        
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
              GRAN FINAL DE EVENTO
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Ruleta de <span>Premios Vibecode</span>
          </h2>
          <p className="text-xs text-slate-300">
            Sorteo oficial exclusivo para equipos con 100% de completitud (5/5 postas).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={soundEnabled ? 'Desactivar Sonido' : 'Activar Sonido'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          <button
            onClick={() => setModoDemo(!modoDemo)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              modoDemo
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {modoDemo ? 'Modo Demo Activo (Todos los equipos)' : 'Modo Estricto (Solo 100% completados)'}
          </button>
        </div>
      </div>

      {/* Main Wheel Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wheel Canvas Container (2 Columns) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-slate-800 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          
          {eligibleEquipos.length === 0 && !modoDemo && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center space-y-2 max-w-md">
              <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Ningún equipo ha completado aún las 5 postas</h4>
              <p className="text-xs text-slate-300">
                Los equipos aparecerán automáticamente en la ruleta conforme el moderador apruebe sus misiones. Activa el "Modo Demo" para probar.
              </p>
            </div>
          )}

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              className="max-w-full h-auto drop-shadow-2xl"
            />
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || eligibleEquipos.length === 0}
            className={`w-full max-w-xs py-4 rounded-2xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl transition-all ${
              isSpinning || eligibleEquipos.length === 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-ucb-gold to-amber-400 text-slate-950 hover:brightness-110 shadow-amber-500/30 scale-105 active:scale-95'
            }`}
          >
            <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? '¡GIRANDO RULETA!' : '¡GIRAR RULETA!'}
          </button>
        </div>

        {/* Sidebar Controls & Winners History */}
        <div className="space-y-6">
          
          {/* Prize Selection */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" /> Seleccionar Premio a Sortear:
            </h3>

            <div className="space-y-2">
              {premios.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPremio(p)}
                  className={`w-full p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedPremio?.id === p.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.icono}</span>
                    <span>{p.nombre}</span>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                    x{p.cantidad}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Winners History */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-ucb-gold" /> Ganadores del Sorteo ({sorteos.length})
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {sorteos.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Aún no hay ganadores registrados.</p>
              ) : (
                sorteos.map((s) => (
                  <div key={s.id} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-ucb-gold block">[{s.equipoId}] {s.equipoNombre}</span>
                      <span className="text-[11px] text-slate-300">Premio: {s.premioNombre}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{s.fecha}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Winner Modal */}
      {winnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-glow p-8 rounded-3xl max-w-md w-full text-center space-y-6 border-amber-400/50 shadow-2xl animate-bounceSubtle">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-ucb-gold rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-400/40 text-4xl">
              🏆
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono uppercase tracking-widest">
                ¡GANADOR OFICIAL!
              </span>
              <h3 className="text-2xl font-black text-white mt-2 font-mono">
                [{winnerModal.equipo.id}] {winnerModal.equipo.nombre}
              </h3>
              <p className="text-sm text-amber-300 font-semibold mt-1">
                Premio: {winnerModal.premio.icono} {winnerModal.premio.nombre}
              </p>
            </div>

            <button
              onClick={() => setWinnerModal(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-ucb-gold text-slate-950 font-bold text-sm rounded-xl hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all"
            >
              ¡Continuar Evento!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
