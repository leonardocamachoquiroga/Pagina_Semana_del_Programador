import React, { useEffect, useState } from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { SpeedtestGame } from './games/SpeedtestGame';
import { WendoDisplay } from './games/WendoDisplay';
import { WebDesignDisplay } from './games/WebDesignDisplay';
import { BugHuntGame } from './games/BugHuntGame';
import { HanoiGame } from './games/HanoiGame';
import { POSTAS } from '../utils/routing';
import type { PostaId } from '../types/game';

interface TVRouterProps {
  initialPostaId?: PostaId;
}

const validPosta = (value: string | null): PostaId | null => {
  const id = Number(value);
  return [1, 2, 3, 4, 5].includes(id) ? (id as PostaId) : null;
};

export const TVRouter: React.FC<TVRouterProps> = ({ initialPostaId }) => {
  const [activePostaId, setActivePostaId] = useState<PostaId | null>(initialPostaId ?? null);

  useEffect(() => {
    const queryPosta = validPosta(new URLSearchParams(window.location.search).get('posta'));
    if (queryPosta) setActivePostaId(queryPosta);
  }, []);

  const selectPosta = (postaId: PostaId) => {
    setActivePostaId(postaId);
    window.history.replaceState({}, '', `/tv?posta=${postaId}`);
  };

  const returnToLauncher = () => {
    setActivePostaId(null);
    window.history.replaceState({}, '', '/tv');
  };

  if (!activePostaId) {
    return (
      <section className="launcher-page" aria-labelledby="launcher-title">
        <header className="launcher-header">
          <div>
            <span className="eyebrow">02 / CENTRO DE DESAFÍOS</span>
            <h1 id="launcher-title" className="page-title">Estaciones</h1>
            <p>Elige el reto que está listo para recibir al siguiente equipo.</p>
          </div>
          <div className="launcher-count" aria-label="Cinco estaciones disponibles">
            <strong>05</strong>
            <span className="mono-label">retos disponibles</span>
          </div>
        </header>

        <div className="launcher-grid">
          {POSTAS.map((posta) => (
            <button type="button" className={`launcher-card accent-${posta.accent}`} key={posta.id} onClick={() => selectPosta(posta.id)}>
              <div className="launcher-card__head">
                <span className="station-index">{String(posta.id).padStart(2, '0')}</span>
                <span className="station-tag">{posta.categoria}</span>
              </div>
              <div className="launcher-card__body">
                <h2>{posta.titulo}</h2>
                <p>{posta.descripcion}</p>
              </div>
              <div className="launcher-card__footer">
                <span className="launcher-card__meta">{posta.duracionMinutos} MIN <i aria-hidden="true" /> {posta.jugadores}</span>
                <span className="launcher-card__cta">Abrir <ArrowRight aria-hidden="true" /></span>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="game-route" aria-label="Estación activa">
      <div className="station-switcher" aria-label="Cambiar de estación">
        <span className="station-switcher__label"><LayoutGrid aria-hidden="true" /> Estaciones</span>
        {POSTAS.map((posta) => (
          <button
            type="button"
            key={posta.id}
            aria-current={activePostaId === posta.id ? 'true' : undefined}
            onClick={() => selectPosta(posta.id)}
          >
            P{String(posta.id).padStart(2, '0')} · {posta.titulo}
          </button>
        ))}
        <button type="button" className="button-quiet" onClick={returnToLauncher}>Todas las estaciones</button>
      </div>

      {activePostaId === 1 && <SpeedtestGame />}
      {activePostaId === 2 && <WendoDisplay />}
      {activePostaId === 3 && <WebDesignDisplay />}
      {activePostaId === 4 && <BugHuntGame />}
      {activePostaId === 5 && <HanoiGame />}
    </section>
  );
};
