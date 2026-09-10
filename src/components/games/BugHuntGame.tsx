import React, { useState } from 'react';
import { Bug, CheckCircle2, RotateCcw } from 'lucide-react';
import { GameShell } from '../ui/GameShell';
import { TeamValidationPanel } from '../ui/TeamValidationPanel';
import { usePostaValidation } from '../../hooks/usePostaValidation';
import { BUG_CHALLENGES, BUG_DIFFICULTIES, BUG_LANGUAGES, type BugDifficulty, type BugLanguageId, type CodeBugChallenge } from '../../utils/bug-hunt';

interface BugRoundState {
  selectedLines: number[];
  isEvaluated: boolean;
  score: number;
  message: string;
}

type BugProgress = Record<BugLanguageId, Record<BugDifficulty, BugRoundState>>;

const createBugRound = (): BugRoundState => ({
  selectedLines: [],
  isEvaluated: false,
  score: 0,
  message: ''
});

const createBugProgress = (): BugProgress => Object.fromEntries(
  BUG_LANGUAGES.map((language) => [language.id, {
    facil: createBugRound(),
    intermedio: createBugRound(),
    dificil: createBugRound()
  }])
) as BugProgress;

const createCompletionMap = (): Record<BugLanguageId, boolean> => Object.fromEntries(
  BUG_LANGUAGES.map((language) => [language.id, false])
) as Record<BugLanguageId, boolean>;

export const BugHuntGame: React.FC = () => {
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);
  const [selectedDifficultyIndex, setSelectedDifficultyIndex] = useState(0);
  const [progress, setProgress] = useState<BugProgress>(() => createBugProgress());
  const [completedLanguages, setCompletedLanguages] = useState<Record<BugLanguageId, boolean>>(() => createCompletionMap());
  const [finalResults, setFinalResults] = useState<Record<BugLanguageId, { score: number; title: string } | null>>(() => Object.fromEntries(
    BUG_LANGUAGES.map((language) => [language.id, null])
  ) as Record<BugLanguageId, { score: number; title: string } | null>);
  const validation = usePostaValidation(4);

  const selectedLanguage = BUG_LANGUAGES[selectedLanguageIndex];
  const selectedDifficulty = BUG_DIFFICULTIES[selectedDifficultyIndex];
  const challenge: CodeBugChallenge = BUG_CHALLENGES[selectedLanguage.id][selectedDifficulty.id];
  const currentRound = progress[selectedLanguage.id][selectedDifficulty.id];
  const bugCount = challenge.lines.filter((line) => line.isBug).length;
  const isChallengeComplete = Boolean(completedLanguages[selectedLanguage.id]);

  const resetChallenge = () => {
    setProgress(createBugProgress());
    setCompletedLanguages(createCompletionMap());
    setFinalResults(Object.fromEntries(BUG_LANGUAGES.map((language) => [language.id, null])) as Record<BugLanguageId, { score: number; title: string } | null>);
    setSelectedLanguageIndex(0);
    setSelectedDifficultyIndex(0);
    validation.clearMessage();
  };

  const resetCurrentLevel = () => {
    setProgress((current) => ({
      ...current,
      [selectedLanguage.id]: {
        ...current[selectedLanguage.id],
        [selectedDifficulty.id]: createBugRound()
      }
    }));
  };

  const selectLanguage = (index: number) => {
    setSelectedLanguageIndex(index);
    setSelectedDifficultyIndex(0);
    validation.clearMessage();
  };

  const selectDifficulty = (index: number) => {
    setSelectedDifficultyIndex(index);
  };

  const updateCurrentRound = (update: (round: BugRoundState) => BugRoundState) => {
    setProgress((current) => ({
      ...current,
      [selectedLanguage.id]: {
        ...current[selectedLanguage.id],
        [selectedDifficulty.id]: update(current[selectedLanguage.id][selectedDifficulty.id])
      }
    }));
  };

  const toggleLine = (lineNum: number) => {
    if (currentRound.isEvaluated || isChallengeComplete) return;
    updateCurrentRound((round) => ({
      ...round,
      selectedLines: round.selectedLines.includes(lineNum)
        ? round.selectedLines.filter((line) => line !== lineNum)
        : [...round.selectedLines, lineNum]
    }));
  };

  const evaluate = () => {
    if (currentRound.isEvaluated) return;

    const bugLines = challenge.lines.filter((line) => line.isBug).map((line) => line.lineNum);
    const correctSelections = currentRound.selectedLines.filter((line) => bugLines.includes(line)).length;
    const incorrectSelections = currentRound.selectedLines.filter((line) => !bugLines.includes(line)).length;
    const calculatedScore = Math.max(0, (correctSelections / bugLines.length) * 100 - incorrectSelections * 25);
    const score = Math.round(calculatedScore);
    const solved = score === 100 && correctSelections === bugLines.length && incorrectSelections === 0;
    const nextDifficulty = BUG_DIFFICULTIES[selectedDifficultyIndex + 1];
    const languageId = selectedLanguage.id;

    updateCurrentRound((round) => ({
      ...round,
      score,
      isEvaluated: true,
      message: solved && nextDifficulty
        ? `${selectedDifficulty.label} resuelto. Continúa con ${nextDifficulty.label}.`
        : solved && selectedDifficulty.id === 'dificil'
          ? 'Desafío completado. Solicita la validación del encargado.'
          : 'La selección tiene errores. Reinicia este nivel para intentarlo otra vez.'
    }));

    if (selectedDifficulty.id === 'dificil') {
      setCompletedLanguages((current) => ({ ...current, [languageId]: true }));
      setFinalResults((current) => ({ ...current, [languageId]: { score, title: challenge.titulo } }));
      return;
    }

    if (solved && nextDifficulty) setSelectedDifficultyIndex(selectedDifficultyIndex + 1);
  };

  const finalResult = finalResults[selectedLanguage.id];

  return (
    <GameShell posta={validation.posta} onReset={resetChallenge} resetLabel="Reiniciar">
      <div className="game-toolbar game-toolbar--compact">
        <div className="snippet-picker">
          <div className="toolbar-group">
            <span className="toolbar-label"><Bug aria-hidden="true" /> Lenguaje</span>
            <div className="choice-tabs" role="group" aria-label="Seleccionar lenguaje">
              {BUG_LANGUAGES.map((language, index) => (
                <button type="button" className={`choice-tab ${selectedLanguageIndex === index ? 'choice-tab--selected' : ''}`} aria-pressed={selectedLanguageIndex === index} key={language.id} onClick={() => selectLanguage(index)}>
                  {language.label}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-group">
            <span className="toolbar-label">Dificultad</span>
            <div className="choice-tabs" role="group" aria-label="Seleccionar dificultad">
              {BUG_DIFFICULTIES.map((difficulty, index) => (
                <button type="button" className={`choice-tab ${selectedDifficultyIndex === index ? 'choice-tab--selected' : ''}`} aria-pressed={selectedDifficultyIndex === index} key={difficulty.id} onClick={() => selectDifficulty(index)}>
                  {difficulty.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <span className="typing-round" aria-label={`Nivel ${selectedDifficultyIndex + 1} de 3`}>Nivel {selectedDifficultyIndex + 1} de 3</span>
        <span className="game-toolbar__status">{currentRound.selectedLines.length} línea{currentRound.selectedLines.length === 1 ? '' : 's'} seleccionada{currentRound.selectedLines.length === 1 ? '' : 's'}</span>
      </div>

      <section className="game-panel game-panel--focus bug-panel" aria-labelledby="bug-case-title">
        <div className="game-panel__header game-panel__header--split">
          <div>
            <span className="eyebrow">{challenge.lenguaje} / {selectedDifficulty.label}</span>
            <h2 id="bug-case-title">{challenge.titulo}</h2>
            <p className="game-prompt">Selecciona {bugCount === 1 ? 'la línea que contiene el bug' : 'las líneas que contienen los bugs'}.</p>
          </div>
          <div className={`score-display ${currentRound.isEvaluated ? 'score-display--done' : ''}`} aria-live="polite"><strong>{currentRound.score}</strong><span>/ 100</span></div>
        </div>

        <div className="challenge-list" role="list" aria-label="Líneas de código">
          {challenge.lines.map((line) => {
            const selected = currentRound.selectedLines.includes(line.lineNum);
            const stateClass = !currentRound.isEvaluated ? (selected ? 'challenge-button--selected' : '') : line.isBug && selected ? 'challenge-button--correct' : line.isBug ? 'challenge-button--missed' : selected ? 'challenge-button--wrong' : '';
            return (
              <button type="button" className={`challenge-button ${stateClass}`} key={line.lineNum} aria-pressed={selected} onClick={() => toggleLine(line.lineNum)} disabled={currentRound.isEvaluated || isChallengeComplete}>
                <span className="challenge-line-number">{line.lineNum}</span>
                <code className="challenge-code">{line.code}</code>
                {currentRound.isEvaluated && line.isBug && <small>{line.explanation}</small>}
              </button>
            );
          })}
        </div>

        <div className="game-panel__footer">
          {!currentRound.isEvaluated ? (
            <button type="button" className="button button-primary" onClick={evaluate}>
              <Bug aria-hidden="true" /> Evaluar selección
            </button>
          ) : currentRound.score < 100 && selectedDifficulty.id !== 'dificil' ? (
            <div className="form-actions"><p className="feedback feedback--error" aria-live="polite">Resultado: {currentRound.score}/100. Revisa la línea marcada.</p><button type="button" className="button button-secondary" onClick={resetCurrentLevel}><RotateCcw aria-hidden="true" /> Reintentar nivel</button></div>
          ) : (
            <p className="feedback feedback--success" aria-live="polite"><CheckCircle2 aria-hidden="true" /> Resultado: {currentRound.score}/100. {currentRound.message}</p>
          )}
        </div>
      </section>

      <TeamValidationPanel
        posta={validation.posta}
        equipos={validation.equipos}
        selectedTeamId={validation.selectedTeamId}
        onTeamChange={validation.setSelectedTeamId}
        pin={validation.pin}
        onPinChange={validation.setPin}
        onValidate={() => validation.validate(finalResult?.score ?? currentRound.score, 300, `Bugs encontrados en: ${finalResult?.title ?? challenge.titulo}`)}
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
