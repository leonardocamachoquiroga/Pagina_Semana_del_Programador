import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, Users } from 'lucide-react';
import { useEventTeams } from '../hooks/useEventTeams';
import { getPostasCompletadasCount } from '../utils/routing';
import type { Equipo } from '../types/game';
import { TeamDetailsModal } from './ui/TeamDetailsModal';

interface TeamDashboardProps {
  initialId?: string;
}

const normalizeSearch = (value: string) => value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ initialId }) => {
  const { equipos, source, isLoading, error } = useEventTeams();
  const [search, setSearch] = useState(initialId ?? '');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(initialId ?? null);
  const initialSelectionAppliedRef = useRef(false);

  useEffect(() => {
    if (!initialId || isLoading || initialSelectionAppliedRef.current) return;
    initialSelectionAppliedRef.current = true;
    if (equipos.some((team) => team.id === initialId && team.active)) setSelectedTeamId(initialId);
  }, [equipos, initialId, isLoading]);

  const filteredTeams = useMemo(() => {
    const query = normalizeSearch(search.trim());
    return equipos.filter((team) => {
      if (!query) return true;
      return normalizeSearch(team.id).includes(query) || normalizeSearch(team.nombre).includes(query);
    });
  }, [equipos, search]);

  const selectedTeam = !isLoading ? equipos.find((team) => team.id === selectedTeamId) ?? null : null;

  return (
    <section className="page-stack team-layout" aria-labelledby="team-title">
      <div className="page-intro page-intro--compact">
        <div className="page-intro__copy">
          <span className="eyebrow">03 / RUTA DE EQUIPO</span>
          <h1 id="team-title" className="page-title">Equipo</h1>
          <p>Busca por nombre o ID para consultar la ruta.</p>
        </div>
        <div className="page-intro__actions"><span className={`data-status ${source === 'supabase' ? 'data-status--online' : ''}`}><i aria-hidden="true" />{isLoading ? 'Cargando catálogo' : source === 'supabase' ? 'Catálogo sincronizado' : 'Catálogo local'}</span></div>
      </div>

      <section className="page-panel team-search" aria-label="Buscar equipo">
        <div className="panel-heading">
          <div><span className="eyebrow">Catálogo</span><h2>Encuentra tu equipo</h2></div>
          <Users aria-hidden="true" color="var(--color-primary)" />
        </div>
        <label className="field-group team-search__input"><span className="field-label">Nombre o ID</span><span className="field-with-icon"><Search aria-hidden="true" /><input className="field-control" type="search" value={search} onChange={(event) => setSearch(event.target.value)} autoComplete="off" placeholder="Ej. ByteForce o 4821" /></span></label>
        {error && <p className="inline-notice inline-notice--warning">{error}</p>}
      </section>

      <section className="page-panel team-directory" aria-labelledby="team-directory-title">
        <div className="team-directory__header">
          <div><span className="eyebrow">Equipos disponibles</span><h2 id="team-directory-title">Selecciona uno</h2></div>
          <span className="mono-label">{isLoading ? '—' : `${filteredTeams.length} resultado${filteredTeams.length === 1 ? '' : 's'}`}</span>
        </div>
        {isLoading ? (
          <div className="empty-state empty-state--compact" role="status"><span className="status-dot" /><strong>Actualizando catálogo…</strong></div>
        ) : filteredTeams.length ? (
          <div className="team-directory__list" role="list" aria-live="polite">
            {filteredTeams.map((team) => <TeamDirectoryItem key={team.id} team={team} onOpen={() => setSelectedTeamId(team.id)} />)}
          </div>
        ) : (
          <div className="empty-state empty-state--compact"><Users aria-hidden="true" size={26} /><strong>{search ? 'No hay coincidencias' : 'Aún no hay equipos'}</strong><span>{search ? 'Prueba con otro nombre o ID.' : 'El operador todavía no ha registrado equipos.'}</span></div>
        )}
      </section>

      <TeamDetailsModal team={selectedTeam} onClose={() => setSelectedTeamId(null)} />
      {initialId && !isLoading && !selectedTeam && <p className="inline-notice inline-notice--warning" role="alert">No encontramos el equipo activo {initialId}. Puedes buscar otro nombre o ID.</p>}
    </section>
  );
};

const TeamDirectoryItem: React.FC<{ team: Equipo; onOpen: () => void }> = ({ team, onOpen }) => {
  const completed = getPostasCompletadasCount(team);
  return (
    <div role="listitem">
      <button type="button" className="team-directory__item" onClick={onOpen}>
        <span className="team-directory__identity"><span className="station-index">{team.id}</span><span><strong>{team.nombre}</strong><small>{completed}/5 juegos completados</small></span></span>
        <span className="team-directory__open">Ver ruta <ArrowRight aria-hidden="true" /></span>
      </button>
    </div>
  );
};
