import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { AlertCircle, ArrowLeft, Gift, RotateCw, Trophy, Users, Volume2, VolumeX } from 'lucide-react';
import { FullscreenButton } from './ui/FullscreenButton';
import { Modal } from './ui/Modal';
import { useEventTeams } from '../hooks/useEventTeams';
import { esEquipoCompletado, POSTAS } from '../utils/routing';
import { getEquipos, getPremios, getSorteos, registrarGanador, savePremios, subscribeToChanges } from '../utils/storage';
import type { Equipo, Premio, SorteoResultado } from '../types/game';

const pendingGames = (team: Equipo) => POSTAS.filter((posta) => team.progresos[posta.id]?.estado !== 'completado');

export const PrizeRoulette: React.FC = () => {
  const { equipos: syncedTeams, source, error, isLoading } = useEventTeams();
  const [equipos, setEquipos] = useState<Equipo[]>(getEquipos());
  const [premios, setPremios] = useState<Premio[]>(getPremios());
  const [sorteos, setSorteos] = useState<SorteoResultado[]>(getSorteos());
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [modoDemo, setModoDemo] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPremio, setSelectedPremio] = useState<Premio | null>(null);
  const [editingPrize, setEditingPrize] = useState<Premio | null>(null);
  const [editPrizeName, setEditPrizeName] = useState('');
  const [editPrizeQuantity, setEditPrizeQuantity] = useState('');
  const [editPrizeError, setEditPrizeError] = useState('');
  const [winner, setWinner] = useState<{ equipo: Equipo; premio: Premio } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const selectionInitializedRef = useRef(false);

  const availableTeams = useMemo(() => equipos.filter((team) => team.active), [equipos]);
  const selectedTeams = useMemo(() => availableTeams.filter((team) => selectedTeamIds.includes(team.id)), [availableTeams, selectedTeamIds]);
  const eligibleEquipos = useMemo(() => (modoDemo ? selectedTeams : selectedTeams.filter(esEquipoCompletado)), [modoDemo, selectedTeams]);
  const wheelKey = eligibleEquipos.map((team) => team.id).join('|');

  useEffect(() => {
    setEquipos(syncedTeams);
    setSelectedTeamIds((current) => {
      const availableIds = new Set(syncedTeams.filter((team) => team.active).map((team) => team.id));
      if (!isLoading && !selectionInitializedRef.current) {
        selectionInitializedRef.current = true;
        return syncedTeams.filter((team) => team.active && esEquipoCompletado(team)).map((team) => team.id);
      }
      return current.filter((id) => availableIds.has(id));
    });
  }, [isLoading, syncedTeams]);

  useEffect(() => {
    if (modoDemo) return;
    setSelectedTeamIds((current) => current.filter((id) => {
      const team = availableTeams.find((item) => item.id === id);
      return Boolean(team && esEquipoCompletado(team));
    }));
  }, [availableTeams, modoDemo]);

  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      setEquipos(getEquipos());
      setPremios(getPremios());
      setSorteos(getSorteos());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedPremio && premios[0]) setSelectedPremio(premios[0]);
  }, [premios, selectedPremio]);

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    void audioContextRef.current?.close();
  }, []);

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const center = canvas.width / 2;
    const radius = center - 22;
    const items = eligibleEquipos.length ? eligibleEquipos : [{ id: '0000', nombre: 'Selecciona equipos', active: true } as Equipo];
    const segmentAngle = (Math.PI * 2) / items.length;
    const colors = ['#0789BE', '#6F7DE0', '#0C3024', '#302718', '#151A43'];

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(center, center);
    context.rotate(-Math.PI / 2);
    for (let index = 0; index < items.length; index += 1) {
      const start = angle + index * segmentAngle;
      const end = start + segmentAngle;
      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, radius, start, end);
      context.closePath();
      context.fillStyle = colors[index % colors.length];
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = '#030810';
      context.stroke();

      context.save();
      context.rotate(start + segmentAngle / 2);
      context.textAlign = 'right';
      context.textBaseline = 'middle';
      context.fillStyle = '#F4FAFF';
      context.font = '600 15px Montserrat, Arial, sans-serif';
      const label = items[index].id === '0000' ? items[index].nombre : `[${items[index].id}] ${items[index].nombre.slice(0, 15)}`;
      context.fillText(label, radius - 22, 0);
      context.restore();
    }
    context.restore();

    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.lineWidth = 7;
    context.strokeStyle = '#76E1FF';
    context.stroke();
    context.beginPath();
    context.arc(center, center, 28, 0, Math.PI * 2);
    context.fillStyle = '#030810';
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = '#F0C65B';
    context.stroke();
    context.fillStyle = '#F0C65B';
    context.font = '800 12px Geist Mono, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('UCB', center, center);
  };

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [modoDemo, wheelKey]);

  const playTick = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioContextClass();
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(360, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(120, context.currentTime + 0.045);
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.045);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.045);
    } catch {
      // El audio es opcional y no debe interrumpir la operación.
    }
  };

  const spin = () => {
    if (isSpinning || !eligibleEquipos.length || !selectedPremio) return;
    setIsSpinning(true);
    const start = performance.now();
    const duration = 4200 + Math.random() * 1200;
    const speed = 0.25 + Math.random() * 0.12;
    const segmentAngle = (Math.PI * 2) / eligibleEquipos.length;
    let previousSegment = -1;
    let winningIndex = 0;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      angleRef.current = (angleRef.current + speed * (1 - eased)) % (Math.PI * 2);
      drawWheel(angleRef.current);
      const pointerAngle = Math.PI / 2;
      let normalized = (pointerAngle - angleRef.current) % (Math.PI * 2);
      if (normalized < 0) normalized += Math.PI * 2;
      winningIndex = Math.floor(normalized / segmentAngle) % eligibleEquipos.length;
      if (winningIndex !== previousSegment) {
        previousSegment = winningIndex;
        playTick();
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      animationRef.current = null;
      setIsSpinning(false);
      const winningTeam = eligibleEquipos[winningIndex];
      if (!winningTeam || !selectedPremio) return;
      registrarGanador(winningTeam.id, winningTeam.nombre, selectedPremio.nombre);
      setSorteos(getSorteos());
      setWinner({ equipo: winningTeam, premio: selectedPremio });
      confetti({ particleCount: 80, spread: 62, origin: { y: 0.62 }, colors: ['#11B8EE', '#76E1FF', '#F0C65B', '#5DE2A1'] });
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const openPrizeEditor = (prize: Premio) => {
    setEditingPrize(prize);
    setEditPrizeName(prize.nombre);
    setEditPrizeQuantity(String(prize.cantidad));
    setEditPrizeError('');
  };

  const savePrize = () => {
    if (!editingPrize) return;
    const name = editPrizeName.trim();
    const quantity = Number(editPrizeQuantity);
    if (name.length < 2) {
      setEditPrizeError('Escribe un nombre válido para el premio.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      setEditPrizeError('La cantidad debe ser un número entero igual o mayor que 0.');
      return;
    }

    const updated = { ...editingPrize, nombre: name, cantidad: quantity };
    setPremios((current) => current.map((prize) => prize.id === updated.id ? updated : prize));
    savePremios(premios.map((prize) => prize.id === updated.id ? updated : prize));
    setSelectedPremio((current) => current?.id === updated.id ? updated : current);
    setEditingPrize(null);
  };

  const toggleTeam = (team: Equipo) => {
    if (!modoDemo && !esEquipoCompletado(team)) return;
    setSelectedTeamIds((current) => current.includes(team.id) ? current.filter((id) => id !== team.id) : [...current, team.id]);
  };

  return (
    <section className="page-stack" aria-labelledby="roulette-title">
      <div className="page-intro page-intro--compact">
        <div className="page-intro__copy"><a className="back-link" href="/"><ArrowLeft aria-hidden="true" /> Volver</a><span className="eyebrow">05 / GRAN FINAL</span><h1 id="roulette-title" className="page-title">Ruleta de premios</h1><p>Elige el premio y los equipos participantes. El modo estricto acepta únicamente rutas completas.</p></div>
        <div className="page-intro__actions"><span className={`data-status ${source === 'supabase' ? 'data-status--online' : ''}`}><i aria-hidden="true" />{isLoading ? 'Cargando equipos' : source === 'supabase' ? 'Equipos sincronizados' : 'Equipos locales'}</span><FullscreenButton /></div>
      </div>

      {error && <p className="inline-notice inline-notice--warning">{error}</p>}
      {isLoading && <p className="inline-notice">Actualizando catálogo de equipos…</p>}

      <div className="roulette-layout">
        <section className="page-panel roulette-stage">
          {eligibleEquipos.length === 0 && !modoDemo && <div className="inline-notice inline-notice--warning"><AlertCircle aria-hidden="true" /> Selecciona al menos un equipo completo.</div>}
          <div className="wheel-frame"><canvas ref={canvasRef} className="wheel-canvas" width="520" height="520" aria-label="Ruleta de equipos" /></div>
          <div className="form-actions">
            <button type="button" className="button button-primary" onClick={spin} disabled={isSpinning || !eligibleEquipos.length || !selectedPremio}><RotateCw aria-hidden="true" /> {isSpinning ? 'Girando…' : 'Girar ruleta'}</button>
            <button type="button" className="icon-button" onClick={() => setSoundEnabled((value) => !value)} aria-label={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}>{soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</button>
          </div>
          <button type="button" className={`control-button ${modoDemo ? 'control-button--primary' : ''}`} onClick={() => setModoDemo((value) => !value)}>{modoDemo ? 'Modo prueba activo' : 'Modo estricto: solo completos'}</button>
          {modoDemo && <p className="field-help">El modo prueba permite incluir incompletos seleccionados; no lo uses para el sorteo oficial.</p>}
        </section>

        <div className="page-stack">
          <section className="page-panel roulette-teams" aria-labelledby="roulette-teams-title">
            <div className="panel-heading"><div><span className="eyebrow">Participantes</span><h2 id="roulette-teams-title">Selecciona equipos</h2></div><span className="mono-label">{selectedTeams.length} seleccionados</span></div>
            <div className="roulette-team-list">
              {isLoading ? <div className="empty-state empty-state--compact" role="status"><span className="status-dot" /><strong>Cargando equipos…</strong></div> : availableTeams.length ? availableTeams.map((team) => <RouletteTeamOption key={team.id} team={team} selected={selectedTeamIds.includes(team.id)} disabled={!modoDemo && !esEquipoCompletado(team)} onToggle={() => toggleTeam(team)} />) : <div className="empty-state empty-state--compact"><UsersIcon /><strong>No hay equipos activos</strong><span>Regístralos o actívalos desde Operador.</span></div>}
            </div>
          </section>

          <section className="page-panel">
            <div className="panel-heading"><div><span className="eyebrow">Inventario de premios</span><h2>Premios</h2></div><Gift aria-hidden="true" color="var(--color-warning)" /></div>
            <div className="choice-list">
              {premios.map((premio) => <div className={`prize-option ${selectedPremio?.id === premio.id ? 'prize-option--selected' : ''}`} key={premio.id}><button type="button" className="choice-button" aria-pressed={selectedPremio?.id === premio.id} onClick={() => { setSelectedPremio(premio); openPrizeEditor(premio); }} aria-label={`Seleccionar y editar premio ${premio.nombre}`}><span><strong>{premio.icono} · {premio.nombre}</strong><small>Disponibles: {premio.cantidad}</small></span><span className="prize-row__stock">Editar · x{premio.cantidad}</span></button></div>)}
            </div>
          </section>

          <section className="page-panel">
            <div className="panel-heading"><div><span className="eyebrow">Registro local</span><h2>Ganadores ({sorteos.length})</h2></div><Trophy aria-hidden="true" color="var(--color-warning)" /></div>
            <div className="draw-list">{sorteos.length ? sorteos.map((draw) => <div className="draw-row" key={draw.id}><span className="station-index">{draw.equipoId}</span><span><strong>{draw.equipoNombre}</strong><small>{draw.premioNombre}</small></span><small>{draw.fecha}</small></div>) : <div className="empty-state"><Trophy aria-hidden="true" size={25} /><span>Aún no hay ganadores registrados.</span></div>}</div>
          </section>
        </div>
      </div>

      <Modal open={Boolean(editingPrize)} onClose={() => setEditingPrize(null)} eyebrow="INVENTARIO / PREMIO" title="Editar premio" titleId="edit-prize-title" size="compact" closeLabel="Cerrar edición de premio">
        {editingPrize && <form className="edit-prize-form" onSubmit={(event) => { event.preventDefault(); savePrize(); }}>
          {editPrizeError && <p className="inline-notice inline-notice--error" role="alert">{editPrizeError}</p>}
          <label className="field-group"><span className="field-label">Premio</span><input className="field-control" value={editPrizeName} onChange={(event) => setEditPrizeName(event.target.value)} /></label>
          <label className="field-group"><span className="field-label">Cantidad disponible</span><input className="field-control" type="number" min="0" step="1" value={editPrizeQuantity} onChange={(event) => setEditPrizeQuantity(event.target.value)} /></label>
          <div className="form-actions"><button type="submit" className="button button-primary">Guardar</button><button type="button" className="button button-quiet" onClick={() => setEditingPrize(null)}>Cancelar</button></div>
        </form>}
      </Modal>

      <Modal open={Boolean(winner)} onClose={() => setWinner(null)} eyebrow="RESULTADO OFICIAL" title="Tenemos ganador" titleId="winner-title" size="compact" closeLabel="Cerrar resultado">
        {winner && <div className="dialog-body__stack"><div className="roulette-winner"><span className="mono-label">EQUIPO SELECCIONADO</span><strong>[{winner.equipo.id}] {winner.equipo.nombre}</strong><span>{winner.premio.icono} · {winner.premio.nombre}</span></div><button type="button" className="button button-primary" onClick={() => setWinner(null)}>Continuar evento</button></div>}
      </Modal>
    </section>
  );
};

const RouletteTeamOption: React.FC<{ team: Equipo; selected: boolean; disabled: boolean; onToggle: () => void }> = ({ team, selected, disabled, onToggle }) => {
  const complete = esEquipoCompletado(team);
  const pending = pendingGames(team);
  return (
    <label className={`roulette-team-option ${complete ? 'roulette-team-option--complete' : 'roulette-team-option--incomplete'} ${disabled ? 'roulette-team-option--disabled' : ''}`}>
      <input type="checkbox" checked={selected} disabled={disabled} onChange={onToggle} />
      <span className="roulette-team-option__copy"><strong>{team.nombre} <small>· #{team.id}</small></strong>{complete ? <span className="team-eligibility team-eligibility--complete">✓ Todos los juegos completados</span> : <span className="team-eligibility">Pendientes: {pending.map((posta) => posta.titulo).join(' · ')}</span>}</span>
      <span className="roulette-team-option__status">{complete ? 'Elegible' : disabled ? 'No elegible' : 'Prueba'}</span>
    </label>
  );
};

const UsersIcon = () => <span className="empty-state__mark" aria-hidden="true"><Users aria-hidden="true" size={26} /></span>;
