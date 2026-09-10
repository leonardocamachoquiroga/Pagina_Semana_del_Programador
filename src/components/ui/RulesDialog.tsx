import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { Posta } from '../../types/game';
import { Modal } from './Modal';

interface RulesDialogProps {
  posta: Posta;
}

export const RulesDialog: React.FC<RulesDialogProps> = ({ posta }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="control-button control-button--compact"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <BookOpen aria-hidden="true" />
        <span>Cómo jugar</span>
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        eyebrow={`POSTA ${String(posta.id).padStart(2, '0')} / BRIEFING`}
        title="Cómo jugar"
        titleId="rules-title"
        closeLabel="Cerrar reglas"
      >
        <div className="dialog-objective">
          <span className="status-dot" />
          <div>
            <strong>{posta.titulo}</strong>
            <p>{posta.descripcion}</p>
          </div>
        </div>

        <ol className="rules-list">
          {posta.instrucciones.map((instruction) => (
            <li key={instruction}><span>{instruction}</span></li>
          ))}
        </ol>

        <div className="dialog-footer">
          <span className="mono-label">DURACIÓN / {posta.duracionMinutos} MIN</span>
          <button type="button" className="button button-primary" onClick={() => setIsOpen(false)}>
            Entendido
          </button>
        </div>
      </Modal>
    </>
  );
};
