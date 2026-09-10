import { useCallback, useState } from 'react';
import { loginOperator } from '../lib/team-api';
import { POSTAS } from '../utils/routing';
import { completarPostaEquipo } from '../utils/storage';
import type { PostaId } from '../types/game';
import { useEventTeams } from './useEventTeams';

export function usePostaValidation(postaId: PostaId) {
  const teamState = useEventTeams();
  const posta = POSTAS.find((item) => item.id === postaId)!;
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [pin, setPin] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const clearMessage = useCallback(() => setMessage(null), []);

  const validate = useCallback(
    async (score = 100, timeSeconds?: number, details?: string) => {
      if (!selectedTeamId) {
        setMessage({ type: 'error', text: 'Selecciona un equipo activo antes de validar.' });
        return false;
      }

      if (!pin) {
        setMessage({ type: 'error', text: 'Ingresa el PIN único del operador para validar.' });
        return false;
      }

      setIsValidating(true);
      const authentication = await loginOperator(pin);
      if (!authentication.ok) {
        setIsValidating(false);
        setMessage({
          type: 'error',
          text: authentication.unavailable
            ? 'No se pudo contactar al servidor. La validación administrativa requiere conexión.'
            : 'PIN de operador incorrecto.'
        });
        return false;
      }

      const result = completarPostaEquipo(selectedTeamId, postaId, score, timeSeconds, details);
      if (!result) {
        setIsValidating(false);
        setMessage({ type: 'error', text: 'No se encontró el equipo en este navegador. Actualiza la lista e inténtalo de nuevo.' });
        return false;
      }

      setMessage({ type: 'success', text: `Posta ${postaId} completada para el equipo ${selectedTeamId}.` });
      setPin('');
      setIsValidating(false);
      return true;
    },
    [pin, postaId, selectedTeamId]
  );

  return {
    ...teamState,
    posta,
    selectedTeamId,
    setSelectedTeamId,
    pin,
    setPin,
    isValidating,
    message,
    clearMessage,
    validate
  };
}
