import type { Equipo, PostaId, ProgresoPosta, Premio, SorteoResultado } from '../types/game';
import { POSTAS } from './routing';

const STORAGE_KEY_EQUIPOS = 'vibecode_equipos_v1';
const STORAGE_KEY_PREMIOS = 'vibecode_premios_v1';
const STORAGE_KEY_SORTEOS = 'vibecode_sorteos_v1';
const CHANNEL_NAME = 'vibecode_sync_channel';

// Equipos iniciales pre-configurados con IDs de 4 dígitos y distribución circular de postas
const EQUIPOS_INICIALES_DEFAULT: { id: string; nombre: string; postaInicial: PostaId }[] = [
  { id: '1462', nombre: 'Equipo 1462 (Cyber-Devs)', postaInicial: 1 },
  { id: '6462', nombre: 'Equipo 6462 (NullPointers)', postaInicial: 2 },
  { id: '1024', nombre: 'Equipo 1024 (BinaryByte)', postaInicial: 3 },
  { id: '2048', nombre: 'Equipo 2048 (MatrixSquad)', postaInicial: 4 },
  { id: '4096', nombre: 'Equipo 4096 (StackOverflow)', postaInicial: 5 },
  { id: '8192', nombre: 'Equipo 8192 (AlgoRiders)', postaInicial: 1 },
  { id: '7351', nombre: 'Equipo 7351 (CodeHackers)', postaInicial: 2 },
  { id: '9900', nombre: 'Equipo 9900 (LogicBombs)', postaInicial: 3 },
  { id: '3141', nombre: 'Equipo 3141 (PiDevs)', postaInicial: 4 },
  { id: '5555', nombre: 'Equipo 5555 (SynthWave)', postaInicial: 5 }
];

const PREMIOS_DEFAULT: Premio[] = [
  { id: 'p1', nombre: 'Polera Conmemorativa UCB', icono: '👕', cantidad: 3, color: '#3b82f6' },
  { id: 'p2', nombre: 'Termo de Acero Inoxidable', icono: '🥤', cantidad: 2, color: '#10b981' },
  { id: 'p3', nombre: 'Mousepad Gamer XL', icono: '🖱️', cantidad: 3, color: '#8b5cf6' },
  { id: 'p4', nombre: 'Kit de Stickers + Audífonos', icono: '🎧', cantidad: 4, color: '#f59e0b' },
  { id: 'p5', nombre: 'Trofeo Vibecode 2026', icono: '🏆', cantidad: 1, color: '#ec4899' }
];

function buildDefaultProgresos(): Record<PostaId, ProgresoPosta> {
  const progresos: Record<PostaId, ProgresoPosta> = {
    1: { postaId: 1, estado: 'pendiente' },
    2: { postaId: 2, estado: 'pendiente' },
    3: { postaId: 3, estado: 'pendiente' },
    4: { postaId: 4, estado: 'pendiente' },
    5: { postaId: 5, estado: 'pendiente' }
  };
  return progresos;
}

let channel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel no soportado:', e);
  }
}

export function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vibecode_data_updated'));
    if (channel) {
      channel.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
    }
  }
}

export function subscribeToChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleLocalEvent = () => callback();
  window.addEventListener('vibecode_data_updated', handleLocalEvent);

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'DATA_UPDATED') {
      callback();
    }
  };

  if (channel) {
    channel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('vibecode_data_updated', handleLocalEvent);
    if (channel) {
      channel.removeEventListener('message', handleBroadcast);
    }
  };
}

export function getEquipos(): Equipo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EQUIPOS);
    if (!raw) {
      const iniciales: Equipo[] = EQUIPOS_INICIALES_DEFAULT.map((eq) => ({
        id: eq.id,
        nombre: eq.nombre,
        postaInicial: eq.postaInicial,
        progresos: buildDefaultProgresos(),
        creadoEn: new Date().toISOString()
      }));
      localStorage.setItem(STORAGE_KEY_EQUIPOS, JSON.stringify(iniciales));
      return iniciales;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo equipos de localStorage:', e);
    return [];
  }
}

export function getEquipoById(id: string): Equipo | null {
  const equipos = getEquipos();
  return equipos.find((e) => e.id === id) || null;
}

export function saveEquipos(equipos: Equipo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_EQUIPOS, JSON.stringify(equipos));
    notifyChange();
  } catch (e) {
    console.error('Error guardando equipos:', e);
  }
}

export function registrarOCrearEquipo(id: string, nombreCustom?: string): Equipo {
  const equipos = getEquipos();
  const existente = equipos.find((e) => e.id === id);
  if (existente) return existente;

  // Asignar posta inicial de forma balanceada
  const count = equipos.length;
  const postaInicial = ((count % 5) + 1) as PostaId;
  const nuevoEquipo: Equipo = {
    id,
    nombre: nombreCustom || `Equipo ${id}`,
    postaInicial,
    progresos: buildDefaultProgresos(),
    creadoEn: new Date().toISOString()
  };

  equipos.push(nuevoEquipo);
  saveEquipos(equipos);
  return nuevoEquipo;
}

export function completarPostaEquipo(
  equipoId: string,
  postaId: PostaId,
  score?: number,
  tiempoSegundos?: number,
  detalles?: string
): Equipo | null {
  const equipos = getEquipos();
  const index = equipos.findIndex((e) => e.id === equipoId);
  if (index === -1) return null;

  const equipo = equipos[index];
  equipo.progresos[postaId] = {
    postaId,
    estado: 'completado',
    completadoEn: new Date().toISOString(),
    score: score ?? 100,
    tiempoSegundos,
    detalles
  };

  equipos[index] = equipo;
  saveEquipos(equipos);
  return equipo;
}

export function resetearEquipo(equipoId: string): Equipo | null {
  const equipos = getEquipos();
  const index = equipos.findIndex((e) => e.id === equipoId);
  if (index === -1) return null;

  equipos[index].progresos = buildDefaultProgresos();
  saveEquipos(equipos);
  return equipos[index];
}

export function resetearTodoElEvento(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_EQUIPOS);
  localStorage.removeItem(STORAGE_KEY_SORTEOS);
  getEquipos(); // Re-inicializa defaults
  notifyChange();
}

// Gestor de Premios
export function getPremios(): Premio[] {
  if (typeof window === 'undefined') return PREMIOS_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREMIOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PREMIOS, JSON.stringify(PREMIOS_DEFAULT));
      return PREMIOS_DEFAULT;
    }
    return JSON.parse(raw);
  } catch (e) {
    return PREMIOS_DEFAULT;
  }
}

export function savePremios(premios: Premio[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PREMIOS, JSON.stringify(premios));
  notifyChange();
}

// Gestor de Sorteos / Ganadores
export function getSorteos(): SorteoResultado[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SORTEOS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function registrarGanador(equipoId: string, equipoNombre: string, premioNombre: string): SorteoResultado {
  const sorteos = getSorteos();
  const nuevo: SorteoResultado = {
    id: 's_' + Date.now(),
    equipoId,
    equipoNombre,
    premioNombre,
    fecha: new Date().toLocaleTimeString()
  };
  sorteos.unshift(nuevo);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SORTEOS, JSON.stringify(sorteos));
    notifyChange();
  }
  return nuevo;
}
