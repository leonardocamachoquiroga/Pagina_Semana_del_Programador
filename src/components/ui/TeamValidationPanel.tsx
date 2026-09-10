import React from 'react';
import { CheckCircle2, KeyRound, Radio } from 'lucide-react';
import type { Equipo, Posta } from '../../types/game';
import { TeamPicker } from './TeamPicker';

interface TeamValidationPanelProps {
  posta: Posta;
  equipos: Equipo[];
  selectedTeamId: string;
  onTeamChange: (id: string) => void;
  pin: string;
  onPinChange: (value: string) => void;
  onValidate: () => void | Promise<boolean>;
  isLoading?: boolean;
  isValidating?: boolean;
  source?: 'supabase' | 'local' | 'loading';
  connectionError?: string;
  message?: { type: 'success' | 'error'; text: string } | null;
  disabled?: boolean;
}

export const TeamValidationPanel: React.FC<TeamValidationPanelProps> = ({
  posta,
  equipos,
  selectedTeamId,
  onTeamChange,
  pin,
  onPinChange,
  onValidate,
  isLoading = false,
  isValidating = false,
  source = 'local',
  connectionError,
  message,
  disabled = false
}) => (
  <section className="validation-panel">
    <div className="validation-header">
      <div>
        <span className="eyebrow">CIERRE DE ESTACIÓN</span>
        <h2>Validar resultado</h2>
      </div>
      <span className={`data-status ${source === 'supabase' ? 'data-status--online' : ''}`}>
        <Radio aria-hidden="true" /> {source === 'loading' ? 'CARGANDO CATÁLOGO' : source === 'supabase' ? 'CATÁLOGO REMOTO' : 'CATÁLOGO LOCAL'}
      </span>
    </div>

    {connectionError && <p className="inline-notice inline-notice--warning">{connectionError}</p>}
    {message && <p className={`inline-notice inline-notice--${message.type}`}>{message.text}</p>}

    <div className="validation-fields">
      <TeamPicker equipos={equipos} selectedId={selectedTeamId} onChange={onTeamChange} isLoading={isLoading} />
      <label className="field-group field-group--pin">
        <span className="field-label">PIN de operador</span>
        <span className="field-with-icon">
          <KeyRound aria-hidden="true" />
          <input className="field-control" type="password" inputMode="numeric" value={pin} onChange={(event) => onPinChange(event.target.value)} placeholder="PIN del operador" autoComplete="off" />
        </span>
      </label>
      <button type="button" className="button button-primary validation-submit" onClick={onValidate} disabled={disabled || isLoading || isValidating || !selectedTeamId || !pin}>
        <CheckCircle2 aria-hidden="true" />
        {isValidating ? 'Validando…' : `Validar posta ${posta.id}`}
      </button>
    </div>
  </section>
);
