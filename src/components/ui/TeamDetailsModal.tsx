import React from 'react';
import { CheckCircle2, Clock3, Users } from 'lucide-react';
import { esEquipoCompletado, getPostasCompletadasCount, getSecuenciaPostas, POSTAS } from '../../utils/routing';
import type { Equipo } from '../../types/game';
import { Modal } from './Modal';

interface TeamDetailsModalProps {
  team: Equipo | null;
  onClose: () => void;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ team, onClose }) => {
  if (!team) return null;

  const completedCount = getPostasCompletadasCount(team);
  const finished = esEquipoCompletado(team);
  const pending = POSTAS.filter((posta) => team.progresos[posta.id]?.estado !== 'completado');
  const sequence = getSecuenciaPostas(team.postaInicial);

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={`EQUIPO / #${team.id}`}
      title={team.nombre}
      titleId="team-details-title"
      size="wide"
      closeLabel="Cerrar detalle del equipo"
    >
      <div className="team-detail-summary">
        <div>
          <span className="mono-label">ID DE EQUIPO</span>
          <strong>#{team.id}</strong>
        </div>
        <span className={`status-badge ${team.active ? 'status-badge--active' : 'status-badge--inactive'}`}><i aria-hidden="true" />{team.active ? 'Activo' : 'Inactivo'}</span>
      </div>

      <div className="team-detail-stats">
        <div><CheckCircle2 aria-hidden="true" /><strong>{completedCount}/5</strong><span>juegos completados</span></div>
        <div><Clock3 aria-hidden="true" /><strong>{pending.length}</strong><span>juegos pendientes</span></div>
        <div><Users aria-hidden="true" /><strong>{team.members.length}</strong><span>integrantes</span></div>
      </div>

      <section className="team-detail-section" aria-labelledby="team-members-title">
        <div className="team-detail-section__heading"><span className="eyebrow" id="team-members-title">Integrantes</span></div>
        {team.members.length ? <div className="team-detail-members">{team.members.map((member) => <span className="member-chip" key={member}>{member}</span>)}</div> : <p className="field-help">No hay integrantes registrados.</p>}
      </section>

      <section className="team-detail-section" aria-labelledby="team-route-title">
        <div className="team-detail-section__heading"><span className="eyebrow" id="team-route-title">Estado de la ruta</span>{finished && <span className="status-badge status-badge--active"><i aria-hidden="true" />Completa</span>}</div>
        <div className="team-detail-postas">
          {sequence.map((postaId) => {
            const posta = POSTAS.find((item) => item.id === postaId)!;
            const completed = team.progresos[postaId]?.estado === 'completado';
            return <div className={`team-detail-posta ${completed ? 'team-detail-posta--done' : ''}`} key={posta.id}><span>{String(posta.id).padStart(2, '0')}</span><strong>{posta.titulo}</strong><small>{completed ? 'Completado' : 'Pendiente'}</small></div>;
          })}
        </div>
      </section>

      {!finished && <div className="team-pending-callout"><span className="eyebrow">Le falta completar</span><strong>{pending.map((posta) => posta.titulo).join(' · ')}</strong></div>}
    </Modal>
  );
};
