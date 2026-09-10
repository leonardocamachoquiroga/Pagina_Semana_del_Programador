import React, { useEffect, useRef, useState } from 'react';
import { CircleDot, Trophy } from 'lucide-react';
import { GameShell } from '../ui/GameShell';
import { TeamValidationPanel } from '../ui/TeamValidationPanel';
import { usePostaValidation } from '../../hooks/usePostaValidation';
import { createHanoiPegs, getHanoiRenderOrder, isHanoiSolved, moveDisk, type HanoiPegs } from '../../utils/hanoi';

const DISK_COLORS = ['#5DE2A1', '#11B8EE', '#F0C65B', '#96A4FF', '#FF7B8A'];

interface RectSnapshot {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MovingDisk {
  size: number;
  from: number;
  to: number;
  fromRect: RectSnapshot | null;
  token: number;
}

interface DiskFlight extends MovingDisk {
  toRect: RectSnapshot;
}

const pegName = (index: number) => `Torre ${index + 1}`;
const diskKey = (pegIndex: number, diskSize: number) => `${pegIndex}-${diskSize}`;
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function snapshotRect(element: HTMLElement | null): RectSnapshot | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

export const HanoiGame: React.FC = () => {
  const [numDisks, setNumDisks] = useState(3);
  const [pegs, setPegs] = useState<HanoiPegs>(() => createHanoiPegs(3));
  const [selectedPegIndex, setSelectedPegIndex] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [movingDisk, setMovingDisk] = useState<MovingDisk | null>(null);
  const [flight, setFlight] = useState<DiskFlight | null>(null);
  const [playMessage, setPlayMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const diskRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const isMovingRef = useRef(false);
  const animationTokenRef = useRef(0);
  const validation = usePostaValidation(5);

  useEffect(() => {
    if (!isTimerRunning || isWon) return undefined;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isTimerRunning, isWon]);

  useEffect(() => {
    if (!movingDisk) {
      setFlight(null);
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const targetRect = snapshotRect(diskRefs.current[diskKey(movingDisk.to, movingDisk.size)]);
      if (!movingDisk.fromRect || !targetRect) {
        isMovingRef.current = false;
        setMovingDisk(null);
        return;
      }
      setFlight({ ...movingDisk, toRect: targetRect });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [movingDisk]);

  useEffect(() => {
    if (!flight) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = window.setTimeout(() => {
      isMovingRef.current = false;
      setFlight(null);
      setMovingDisk(null);
    }, reducedMotion ? 40 : 560);
    return () => window.clearTimeout(finish);
  }, [flight]);

  const initGame = (disks: number) => {
    isMovingRef.current = false;
    setNumDisks(disks);
    setPegs(createHanoiPegs(disks));
    setSelectedPegIndex(null);
    setMoveCount(0);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setIsWon(false);
    setFlight(null);
    setMovingDisk(null);
    setPlayMessage(null);
    validation.clearMessage();
  };

  const handlePegClick = (pegIndex: number) => {
    if (isWon || isMovingRef.current) return;

    if (selectedPegIndex === null) {
      if (pegs[pegIndex].length === 0) return;
      if (!isTimerRunning) setIsTimerRunning(true);
      setSelectedPegIndex(pegIndex);
      setPlayMessage(null);
      return;
    }

    if (selectedPegIndex === pegIndex) {
      setSelectedPegIndex(null);
      return;
    }

    const sourcePeg = pegs[selectedPegIndex];
    const diskToMove = sourcePeg[sourcePeg.length - 1];
    const nextPegs = moveDisk(pegs, selectedPegIndex, pegIndex);

    if (!nextPegs || diskToMove === undefined) {
      setSelectedPegIndex(null);
      setPlayMessage({ type: 'error', text: 'Movimiento no permitido: un disco grande no puede ir sobre uno pequeño.' });
      return;
    }

    isMovingRef.current = true;
    setPegs(nextPegs);
    setMoveCount((value) => value + 1);
    setSelectedPegIndex(null);
    setPlayMessage(null);
    setMovingDisk({
      size: diskToMove,
      from: selectedPegIndex,
      to: pegIndex,
      fromRect: snapshotRect(diskRefs.current[diskKey(selectedPegIndex, diskToMove)]),
      token: animationTokenRef.current + 1
    });
    animationTokenRef.current += 1;

    if (isHanoiSolved(nextPegs, numDisks)) {
      setIsWon(true);
      setIsTimerRunning(false);
      setPlayMessage({ type: 'success', text: 'Torre completada. Solicita la validación del encargado.' });
    }
  };

  const minMoves = 2 ** numDisks - 1;

  return (
    <GameShell posta={validation.posta} onReset={() => initGame(numDisks)} resetLabel="Reiniciar">
      <div className="game-toolbar game-toolbar--compact">
        <div className="toolbar-group">
          <span className="toolbar-label"><CircleDot aria-hidden="true" /> Discos</span>
          {[3, 4, 5].map((disks) => (
            <button type="button" key={disks} className={`control-button control-button--compact ${numDisks === disks ? 'control-button--primary' : ''}`} aria-pressed={numDisks === disks} onClick={() => initGame(disks)}>
              {disks}
            </button>
          ))}
        </div>
        <div className="game-toolbar__stats" aria-label="Estado de la partida">
          <span><b>{moveCount}</b> movimientos</span>
          <span><b>{formatTime(elapsedSeconds)}</b> tiempo</span>
          <span><b>{minMoves}</b> mínimo</span>
        </div>
      </div>

      <section className="game-panel game-panel--focus hanoi-panel" aria-labelledby="hanoi-title">
        <div className="game-panel__header game-panel__header--split">
          <div>
            <span className="eyebrow">Lógica / selección por turnos</span>
            <h2 id="hanoi-title">Lleva todos los discos a la Torre 3</h2>
          </div>
          <span className={`game-state ${isWon ? 'game-state--success' : 'game-state--active'}`} aria-live="polite">
            <i aria-hidden="true" /> {isWon ? 'Completado' : selectedPegIndex === null ? 'Selecciona una torre' : 'Elige el destino'}
          </span>
        </div>

        {playMessage && <p className={`feedback feedback--${playMessage.type}`} aria-live="polite"><span aria-hidden="true">{playMessage.type === 'success' ? <Trophy /> : <CircleDot />}</span>{playMessage.text}</p>}

        <div className="hanoi-board" aria-label="Tablero de Torre de Hanoi">
          {pegs.map((peg, pegIndex) => {
            const renderedPeg = getHanoiRenderOrder(peg);
            const topDisk = peg[peg.length - 1];
            return (
              <button
                type="button"
                className={`hanoi-peg ${selectedPegIndex === pegIndex ? 'hanoi-peg--selected' : ''}`}
                key={pegIndex}
                aria-pressed={selectedPegIndex === pegIndex}
                aria-label={`${selectedPegIndex === null ? 'Seleccionar' : 'Mover al'} ${pegName(pegIndex)}`}
                onClick={() => handlePegClick(pegIndex)}
              >
                <span className="hanoi-peg__label">{pegName(pegIndex)}</span>
                <span className="hanoi-peg__rod" aria-hidden="true" />
                {renderedPeg.map((diskSize) => (
                  <span
                    className={`hanoi-disk ${movingDisk?.to === pegIndex && movingDisk.size === diskSize && topDisk === diskSize ? 'hanoi-disk--arriving' : ''}`}
                    key={diskSize}
                    ref={(element) => { diskRefs.current[diskKey(pegIndex, diskSize)] = element; }}
                    style={{ width: `${35 + (diskSize / numDisks) * 60}%`, '--disk-color': DISK_COLORS[(diskSize - 1) % DISK_COLORS.length] } as React.CSSProperties}
                    aria-hidden="true"
                  >
                    {diskSize}
                  </span>
                ))}
              </button>
            );
          })}
          {flight && (
            <span
              className="hanoi-moving-disk"
              key={flight.token}
              style={{
                '--from-left': `${flight.fromRect?.left ?? flight.toRect.left}px`,
                '--from-top': `${flight.fromRect?.top ?? flight.toRect.top}px`,
                '--to-left': `${flight.toRect.left}px`,
                '--to-top': `${flight.toRect.top}px`,
                '--lift-top': `${Math.max(8, Math.min(flight.fromRect?.top ?? flight.toRect.top, flight.toRect.top) - Math.max(72, flight.toRect.height * 3))}px`,
                width: `${flight.fromRect?.width ?? flight.toRect.width}px`,
                height: `${flight.fromRect?.height ?? flight.toRect.height}px`,
                '--disk-color': DISK_COLORS[(flight.size - 1) % DISK_COLORS.length]
              } as React.CSSProperties}
              aria-hidden="true"
            >
              {flight.size}
            </span>
          )}
        </div>

        <div className="hanoi-instruction" aria-live="polite">
          <span>{selectedPegIndex === null ? 'Selecciona la torre que contiene el disco superior que quieres mover.' : `Disco seleccionado en ${pegName(selectedPegIndex)}. Elige una torre destino.`}</span>
          <small>Un disco grande nunca puede ir sobre uno pequeño.</small>
        </div>
      </section>

      <TeamValidationPanel
        posta={validation.posta}
        equipos={validation.equipos}
        selectedTeamId={validation.selectedTeamId}
        onTeamChange={validation.setSelectedTeamId}
        pin={validation.pin}
        onPinChange={validation.setPin}
        onValidate={() => validation.validate(100, elapsedSeconds, `Hanoi ${numDisks} discos en ${moveCount} movimientos`)}
        isLoading={validation.isLoading}
        isValidating={validation.isValidating}
        source={validation.source}
        connectionError={validation.error}
        message={validation.message}
        disabled={!isWon || Boolean(flight)}
      />
    </GameShell>
  );
};
