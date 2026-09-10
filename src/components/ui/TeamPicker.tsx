import React from 'react';
import type { Equipo } from '../../types/game';

interface TeamPickerProps {
  equipos: Equipo[];
  selectedId: string;
  onChange: (id: string) => void;
  isLoading?: boolean;
  onlyActive?: boolean;
  label?: string;
}

export const TeamPicker: React.FC<TeamPickerProps> = ({ equipos, selectedId, onChange, isLoading = false, onlyActive = true, label = 'Equipo en partida' }) => {
  const visibleTeams = onlyActive ? equipos.filter((equipo) => equipo.active) : equipos;

  return (
    <label className="field-group">
      <span className="field-label">{label}</span>
      <select className="field-control" value={selectedId} onChange={(event) => onChange(event.target.value)} disabled={isLoading || visibleTeams.length === 0}>
        <option value="">{isLoading ? 'Cargando equipos…' : visibleTeams.length ? 'Selecciona un equipo' : 'No hay equipos activos'}</option>
        {visibleTeams.map((equipo) => (
          <option key={equipo.id} value={equipo.id}>
            {equipo.id} · {equipo.nombre}
          </option>
        ))}
      </select>
    </label>
  );
};
