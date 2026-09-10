import React, { useEffect, useState } from 'react';
import { Hand, Pause, Play, RotateCcw } from 'lucide-react';
import { GameShell } from '../ui/GameShell';
import { TeamValidationPanel } from '../ui/TeamValidationPanel';
import { usePostaValidation } from '../../hooks/usePostaValidation';

const LIMIT_SECONDS = 10 * 60;
const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const WendoDisplay: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(LIMIT_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const validation = usePostaValidation(2);

  useEffect(() => {
    if (!isRunning || secondsLeft === 0) {
      if (secondsLeft === 0) setIsRunning(false);
      return undefined;
    }
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const resetGame = () => {
    setSecondsLeft(LIMIT_SECONDS);
    setIsRunning(false);
    validation.clearMessage();
  };

  return (
    <GameShell posta={validation.posta} onReset={resetGame}>
      <div className="game-toolbar game-toolbar--compact">
        <span className="toolbar-label"><Hand aria-hidden="true" /> Reto físico</span>
        <span className="game-toolbar__status">La figura objetivo la entrega el encargado</span>
      </div>

      <section className="game-panel game-panel--focus wendo-panel" aria-labelledby="wendo-title">
        <div className="wendo-stage">
          <div className="stage-symbol" aria-hidden="true"><Hand /></div>
          <div>
            <span className="eyebrow">Coordinación / armado</span>
            <h2 id="wendo-title">Construye el patrón</h2>
            <p>Reproduce con los bloques la figura que te entrega el encargado.</p>
          </div>
          <div className="stage-steps" aria-label="Secuencia del reto">
            <span><b>01</b> Observa</span>
            <span><b>02</b> Coordina</span>
            <span><b>03</b> Entrega</span>
          </div>
        </div>

        <div className={`timer-card timer-card--hero ${secondsLeft < 120 ? 'timer-card--critical' : ''}`} aria-live="polite">
          <span>Tiempo restante</span>
          <strong>{formatTime(secondsLeft)}</strong>
          <div className="timer-actions">
            <button type="button" className="button button-primary" onClick={() => setIsRunning((value) => !value)} disabled={secondsLeft === 0}>
              {isRunning ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" fill="currentColor" />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button type="button" className="control-button control-button--compact" onClick={resetGame}>
              <RotateCcw aria-hidden="true" /> Reiniciar
            </button>
          </div>
        </div>
      </section>

      <p className="game-note"><span aria-hidden="true">●</span> Cuando el equipo termine, solicita la revisión del encargado.</p>

      <TeamValidationPanel
        posta={validation.posta}
        equipos={validation.equipos}
        selectedTeamId={validation.selectedTeamId}
        onTeamChange={validation.setSelectedTeamId}
        pin={validation.pin}
        onPinChange={validation.setPin}
        onValidate={() => validation.validate(100, LIMIT_SECONDS - secondsLeft, 'Reto físico Wendo completado')}
        isLoading={validation.isLoading}
        isValidating={validation.isValidating}
        source={validation.source}
        connectionError={validation.error}
        message={validation.message}
      />
    </GameShell>
  );
};
