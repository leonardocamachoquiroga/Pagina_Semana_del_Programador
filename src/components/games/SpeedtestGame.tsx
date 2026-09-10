import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Code2, Play, RotateCcw } from 'lucide-react';
import { GameShell } from '../ui/GameShell';
import { TeamValidationPanel } from '../ui/TeamValidationPanel';
import { usePostaValidation } from '../../hooks/usePostaValidation';
import { TYPING_DIFFICULTIES, TYPING_LANGUAGES, type TypingDifficulty } from '../../utils/typing';

interface TypingRoundState {
  inputCode: string;
  isStarted: boolean;
  isCompleted: boolean;
  elapsedSeconds: number;
  message: string;
}

type LanguageRounds = Record<TypingDifficulty, TypingRoundState>;
type RoundsByLanguage = Record<number, LanguageRounds>;

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const createRoundState = (): TypingRoundState => ({
  inputCode: '',
  isStarted: false,
  isCompleted: false,
  elapsedSeconds: 0,
  message: ''
});

const createLanguageRounds = (): LanguageRounds => ({
  facil: createRoundState(),
  intermedio: createRoundState(),
  dificil: createRoundState()
});

const createRoundsByLanguage = (): RoundsByLanguage => Object.fromEntries(
  TYPING_LANGUAGES.map((language) => [language.id, createLanguageRounds()])
) as RoundsByLanguage;

const createCompletionMap = (): Record<number, boolean> => Object.fromEntries(
  TYPING_LANGUAGES.map((language) => [language.id, false])
) as Record<number, boolean>;

export const SpeedtestGame: React.FC = () => {
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);
  const [selectedDifficultyIndex, setSelectedDifficultyIndex] = useState(0);
  const [roundsByLanguage, setRoundsByLanguage] = useState<RoundsByLanguage>(() => createRoundsByLanguage());
  const [completedLanguages, setCompletedLanguages] = useState<Record<number, boolean>>(() => createCompletionMap());
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const validation = usePostaValidation(1);

  const selectedLanguage = TYPING_LANGUAGES[selectedLanguageIndex];
  const selectedDifficulty = TYPING_DIFFICULTIES[selectedDifficultyIndex];
  const languageRounds = roundsByLanguage[selectedLanguage.id];
  const activeRound = languageRounds[selectedDifficulty.id];
  const finalRound = languageRounds.dificil;
  const selectedTest = selectedLanguage.pruebas.find((test) => test.dificultad === selectedDifficulty.id) ?? selectedLanguage.pruebas[selectedDifficultyIndex];
  const difficultTest = selectedLanguage.pruebas.find((test) => test.dificultad === 'dificil') ?? selectedLanguage.pruebas[2];
  const targetCode = selectedTest.code;
  const isChallengeComplete = Boolean(completedLanguages[selectedLanguage.id]);

  useEffect(() => {
    if (!activeRound.isStarted || activeRound.isCompleted || isChallengeComplete) return undefined;

    const languageId = selectedLanguage.id;
    const difficultyId = selectedDifficulty.id;
    const timer = window.setInterval(() => {
      setRoundsByLanguage((current) => {
        const language = current[languageId];
        const round = language[difficultyId];
        return {
          ...current,
          [languageId]: {
            ...language,
            [difficultyId]: { ...round, elapsedSeconds: round.elapsedSeconds + 1 }
          }
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeRound.isCompleted, activeRound.isStarted, isChallengeComplete, selectedDifficulty.id, selectedLanguage.id]);

  const updateRound = (difficulty: TypingDifficulty, update: (round: TypingRoundState) => TypingRoundState) => {
    const languageId = selectedLanguage.id;
    setRoundsByLanguage((current) => {
      const language = current[languageId];
      return {
        ...current,
        [languageId]: { ...language, [difficulty]: update(language[difficulty]) }
      };
    });
  };

  const resetChallenge = () => {
    setRoundsByLanguage((current) => ({ ...current, [selectedLanguage.id]: createLanguageRounds() }));
    setCompletedLanguages((current) => ({ ...current, [selectedLanguage.id]: false }));
    setSelectedDifficultyIndex(0);
    validation.clearMessage();
  };

  const startGame = () => {
    if (activeRound.isCompleted || isChallengeComplete) return;
    updateRound(selectedDifficulty.id, (round) => ({ ...round, isStarted: true, message: '' }));
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const selectLanguage = (index: number) => {
    setSelectedLanguageIndex(index);
    setSelectedDifficultyIndex(0);
    validation.clearMessage();
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const selectDifficulty = (index: number) => {
    setSelectedDifficultyIndex(index);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const accuracy = targetCode.length
    ? Math.round((activeRound.inputCode.split('').filter((character, index) => character === targetCode[index]).length / targetCode.length) * 100)
    : 0;
  const wpm = activeRound.elapsedSeconds > 0 ? Math.round((activeRound.inputCode.length / 5) / (activeRound.elapsedSeconds / 60)) : 0;
  const finalAccuracy = difficultTest.code.length
    ? Math.round((finalRound.inputCode.split('').filter((character, index) => character === difficultTest.code[index]).length / difficultTest.code.length) * 100)
    : 0;
  const finalWpm = finalRound.elapsedSeconds > 0 ? Math.round((finalRound.inputCode.length / 5) / (finalRound.elapsedSeconds / 60)) : 0;

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeRound.isCompleted || isChallengeComplete) return;

    const value = event.target.value;
    if (value !== targetCode) {
      updateRound(selectedDifficulty.id, (round) => ({ ...round, inputCode: value, message: '' }));
      return;
    }

    const nextDifficulty = TYPING_DIFFICULTIES[selectedDifficultyIndex + 1];
    const languageId = selectedLanguage.id;
    setRoundsByLanguage((current) => {
      const language = current[languageId];
      const completedRound = language[selectedDifficulty.id];
      const nextLanguage: LanguageRounds = {
        ...language,
        [selectedDifficulty.id]: {
          ...completedRound,
          inputCode: value,
          isStarted: true,
          isCompleted: true,
          message: nextDifficulty
            ? `${selectedDifficulty.label} completado. Continúa con ${nextDifficulty.label}.`
            : 'Desafío completado. Solicita la validación del encargado.'
        }
      };

      if (nextDifficulty) {
        nextLanguage[nextDifficulty.id] = {
          ...language[nextDifficulty.id],
          isStarted: true,
          message: `${selectedDifficulty.label} completado. Continúa con ${nextDifficulty.label}.`
        };
      }

      return { ...current, [languageId]: nextLanguage };
    });

    if (nextDifficulty) {
      setSelectedDifficultyIndex(selectedDifficultyIndex + 1);
      window.requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    setCompletedLanguages((current) => ({ ...current, [languageId]: true }));
  };

  const preventPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
  };

  const preventDrop = (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
  };

  const preventPasteShortcut = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const pasteShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v';
    const insertShortcut = event.shiftKey && event.key === 'Insert';
    if (pasteShortcut || insertShortcut) event.preventDefault();
  };

  return (
    <GameShell posta={validation.posta} onReset={resetChallenge}>
      <div className="game-toolbar game-toolbar--compact">
        <div className="snippet-picker">
          <div className="toolbar-group">
            <span className="toolbar-label"><Code2 aria-hidden="true" /> Lenguaje</span>
            <div className="choice-tabs" role="group" aria-label="Seleccionar lenguaje">
              {TYPING_LANGUAGES.map((language, index) => (
                <button
                  type="button"
                  key={language.id}
                  className={`choice-tab ${selectedLanguageIndex === index ? 'choice-tab--selected' : ''}`}
                  aria-pressed={selectedLanguageIndex === index}
                  onClick={() => selectLanguage(index)}
                >
                  {language.lenguaje}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-group">
            <span className="toolbar-label">Dificultad</span>
            <div className="choice-tabs" role="group" aria-label="Seleccionar dificultad">
              {TYPING_DIFFICULTIES.map((difficulty, index) => (
                <button
                  type="button"
                  key={difficulty.id}
                  className={`choice-tab ${selectedDifficultyIndex === index ? 'choice-tab--selected' : ''}`}
                  aria-pressed={selectedDifficultyIndex === index}
                  onClick={() => selectDifficulty(index)}
                >
                  {difficulty.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <span className="typing-round" aria-label={`Nivel ${selectedDifficultyIndex + 1} de 3`}>Nivel {selectedDifficultyIndex + 1} de 3</span>
        {activeRound.isCompleted ? (
          <span className="game-toolbar__status">Nivel completado</span>
        ) : !activeRound.isStarted ? (
          <button type="button" className="button button-primary" onClick={startGame} disabled={isChallengeComplete}>
            <Play aria-hidden="true" fill="currentColor" /> Iniciar reto
          </button>
        ) : (
          <button type="button" className="control-button control-button--compact" onClick={resetChallenge}>
            <RotateCcw aria-hidden="true" /> Reiniciar
          </button>
        )}
      </div>

      <div className="typing-layout">
        <section className="game-panel game-panel--focus typing-panel" aria-labelledby="target-code-title">
          <div className="game-panel__header game-panel__header--split">
            <div>
              <span className="eyebrow">Código objetivo / {selectedLanguage.lenguaje}</span>
              <h2 id="target-code-title">{selectedTest.titulo}</h2>
            </div>
            <span className="code-length">Nivel {selectedDifficultyIndex + 1} de 3</span>
          </div>
          <pre
            className="code-block code-block--locked"
            aria-label="Código objetivo no seleccionable"
            onCopy={(event) => event.preventDefault()}
            onContextMenu={(event) => event.preventDefault()}
            onDragStart={(event) => event.preventDefault()}
          >{targetCode}</pre>
        </section>

        <section className="game-panel game-panel--focus typing-panel typing-panel--editor" aria-labelledby="editor-title">
          <div className="game-panel__header game-panel__header--split">
            <div>
              <span className="eyebrow">Tu editor / {activeRound.isStarted ? 'en curso' : 'en espera'}</span>
              <h2 id="editor-title">Escribe el código</h2>
            </div>
            <span className={`game-state ${activeRound.isCompleted ? 'game-state--success' : activeRound.isStarted ? 'game-state--active' : ''}`} aria-live="polite">
              <i aria-hidden="true" /> {activeRound.isCompleted ? 'Listo' : activeRound.isStarted ? 'Escribiendo' : 'Esperando'}
            </span>
          </div>
          <textarea
            ref={inputRef}
            className="code-editor"
            value={activeRound.inputCode}
            onChange={handleInput}
            onPaste={preventPaste}
            onDrop={preventDrop}
            onDragOver={preventDrop}
            onKeyDown={preventPasteShortcut}
            onContextMenu={(event) => event.preventDefault()}
            disabled={!activeRound.isStarted || activeRound.isCompleted || isChallengeComplete}
            placeholder={activeRound.isStarted ? 'Escribe aquí respetando espacios y saltos de línea…' : 'Presiona “Iniciar reto” para comenzar.'}
            aria-label="Editor para transcribir el código"
          />
          {activeRound.message && <p className="feedback feedback--success" aria-live="polite"><CheckCircle2 aria-hidden="true" />{activeRound.message}</p>}
        </section>

        <aside className="typing-stats" aria-label="Estado del reto">
          <div className="stat-card stat-card--large"><strong>{formatTime(activeRound.elapsedSeconds)}</strong><span>Tiempo del nivel</span></div>
          <div className="stat-card"><strong>{accuracy}%</strong><span>Precisión actual</span></div>
          <div className="stat-card"><strong>{wpm}</strong><span>Palabras / min</span></div>
        </aside>
      </div>

      <TeamValidationPanel
        posta={validation.posta}
        equipos={validation.equipos}
        selectedTeamId={validation.selectedTeamId}
        onTeamChange={validation.setSelectedTeamId}
        pin={validation.pin}
        onPinChange={validation.setPin}
        onValidate={() => validation.validate(finalAccuracy, finalRound.elapsedSeconds, `Speed Test · ${selectedLanguage.lenguaje} · 3 niveles · WPM: ${finalWpm}`)}
        isLoading={validation.isLoading}
        isValidating={validation.isValidating}
        source={validation.source}
        connectionError={validation.error}
        message={validation.message}
        disabled={!isChallengeComplete}
      />
    </GameShell>
  );
};
