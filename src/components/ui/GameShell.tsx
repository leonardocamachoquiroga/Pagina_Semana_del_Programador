import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { FullscreenButton } from './FullscreenButton';
import { RulesDialog } from './RulesDialog';
import type { Posta } from '../../types/game';

interface GameShellProps {
  posta: Posta;
  children: React.ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  statusLabel?: string;
}

export const GameShell: React.FC<GameShellProps> = ({
  posta,
  children,
  onReset,
  resetLabel = 'Reiniciar',
  statusLabel = 'LISTO PARA JUGAR'
}) => (
  <section className={`game-shell accent-${posta.accent}`} aria-labelledby="game-title">
    <div className="game-frame">
      <header className="game-topbar">
        <div className="game-brandline">
          <a className="back-link" href="/tv" aria-label="Volver al menú de estaciones">
            <ArrowLeft aria-hidden="true" />
            <span>Volver</span>
          </a>
          <span className="brand-divider" aria-hidden="true" />
          <div className="game-brand-copy">
            <span className="mono-label">SISTEMAS UCB / 2026</span>
            <strong>DÍA DEL PROGRAMADOR</strong>
          </div>
        </div>

        <div className="game-actions">
          <span className="live-indicator"><i aria-hidden="true" /> {statusLabel}</span>
          <RulesDialog posta={posta} />
          <FullscreenButton />
          {onReset && (
            <button type="button" className="control-button control-button--compact" onClick={onReset}>
              <RotateCcw aria-hidden="true" />
              <span>{resetLabel}</span>
            </button>
          )}
        </div>
      </header>

      <div className="game-heading">
        <div className="game-heading__title">
          <span className="section-index">POSTA {String(posta.id).padStart(2, '0')}</span>
          <h1 id="game-title">{posta.titulo}</h1>
        </div>
        <div className="game-heading__context">
          <p>{posta.descripcion}</p>
          <span className="game-heading__meta">{posta.duracionMinutos} MIN <i aria-hidden="true" /> {posta.jugadores} <i aria-hidden="true" /> Encargado: {posta.encargado}</span>
        </div>
      </div>

      <div className="game-content">{children}</div>
    </div>
  </section>
);
