import React, { useEffect, useState } from 'react';
import { CheckCircle2, Layers3, Pause, Play, RotateCcw } from 'lucide-react';
import { GameShell } from '../ui/GameShell';
import { TeamValidationPanel } from '../ui/TeamValidationPanel';
import { usePostaValidation } from '../../hooks/usePostaValidation';

const LIMIT_SECONDS = 10 * 60;
const TOPICS = [
  { id: 1, titulo: 'Plataforma de tutorías UCB', desc: 'Sistema de reserva de tutores entre estudiantes con agendamiento y valoraciones.' },
  { id: 2, titulo: 'Dashboard de hackathon 2026', desc: 'Panel para votaciones de jueces, posiciones y tiempo restante de entregas.' },
  { id: 3, titulo: 'Red de proyectos open source', desc: 'Showcase de código creado por estudiantes con repositorios y reconocimientos.' },
  { id: 4, titulo: 'Asistente IA para horarios', desc: 'Interfaz conversacional para optimizar la inscripción de materias.' }
];
const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const WebDesignDisplay: React.FC = () => {
  const [topicIndex, setTopicIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(LIMIT_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const validation = usePostaValidation(3);
  const currentTopic = TOPICS[topicIndex];

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

  const selectTopic = (index: number) => {
    setTopicIndex(index);
    resetGame();
  };

  return (
    <GameShell posta={validation.posta} onReset={resetGame}>
      <div className="game-toolbar game-toolbar--compact">
        <div className="snippet-picker">
          <span className="toolbar-label"><Layers3 aria-hidden="true" /> Brief</span>
          <div className="choice-tabs" role="group" aria-label="Seleccionar brief">
            {TOPICS.map((topic, index) => (
              <button type="button" key={topic.id} className={`choice-tab ${topicIndex === index ? 'choice-tab--selected' : ''}`} aria-pressed={topicIndex === index} onClick={() => selectTopic(index)}>
                {String(topic.id).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
        <span className="game-toolbar__status">Define una solución y preséntala al encargado</span>
      </div>

      <section className="game-panel game-panel--focus design-panel" aria-labelledby="design-brief-title">
        <div className="design-brief">
          <div className="design-brief__topline">
            <span className="eyebrow">Brief {String(currentTopic.id).padStart(2, '0')} / 04</span>
            <span className="game-state game-state--active"><i aria-hidden="true" /> En curso</span>
          </div>
          <h2 id="design-brief-title">{currentTopic.titulo}</h2>
          <p>{currentTopic.desc}</p>
          <div className="deliverable-strip" aria-label="Entregables">
            <span><b>01</b> Estructura</span>
            <span><b>02</b> Diferencial</span>
            <span><b>03</b> Pitch</span>
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

      <p className="game-note"><CheckCircle2 aria-hidden="true" /> Presenta el wireframe al encargado cuando tengas una historia completa.</p>

      <TeamValidationPanel
        posta={validation.posta}
        equipos={validation.equipos}
        selectedTeamId={validation.selectedTeamId}
        onTeamChange={validation.setSelectedTeamId}
        pin={validation.pin}
        onPinChange={validation.setPin}
        onValidate={() => validation.validate(100, LIMIT_SECONDS - secondsLeft, `Tema: ${currentTopic.titulo}`)}
        isLoading={validation.isLoading}
        isValidating={validation.isValidating}
        source={validation.source}
        connectionError={validation.error}
        message={validation.message}
      />
    </GameShell>
  );
};
