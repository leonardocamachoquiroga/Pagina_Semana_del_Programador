import type { Equipo, PostaId, ProgresoPosta, Premio, RemoteTeam, SorteoResultado } from '../types/game';

const STORAGE_KEY_EQUIPOS = 'vibecode_equipos_v1';
const STORAGE_KEY_PREMIOS = 'vibecode_premios_v1';
const STORAGE_KEY_SORTEOS = 'vibecode_sorteos_v1';
const CHANNEL_NAME = 'vibecode_sync_channel';

const EQUIPOS_INICIALES_DEFAULT: { id: string; nombre: string; postaInicial: PostaId }[] = [
  { id: '1462', nombre: 'Equipo 1462 · Cyber-Devs', postaInicial: 1 },
  { id: '6462', nombre: 'Equipo 6462 · NullPointers', postaInicial: 2 },
  { id: '1024', nombre: 'Equipo 1024 · BinaryByte', postaInicial: 3 },
  { id: '2048', nombre: 'Equipo 2048 · MatrixSquad', postaInicial: 4 },
  { id: '4096', nombre: 'Equipo 4096 · StackOverflow', postaInicial: 5 },
  { id: '8192', nombre: 'Equipo 8192 · AlgoRiders', postaInicial: 1 },
  { id: '7351', nombre: 'Equipo 7351 · CodeHackers', postaInicial: 2 },
  { id: '9900', nombre: 'Equipo 9900 · LogicBombs', postaInicial: 3 },
  { id: '3141', nombre: 'Equipo 3141 · PiDevs', postaInicial: 4 },
  { id: '5555', nombre: 'Equipo 5555 · SynthWave', postaInicial: 5 }
];

const PREMIOS_DEFAULT: Premio[] = [
  { id: 'p1', nombre: 'Polera conmemorativa UCB', icono: '▣', cantidad: 3, color: '#11B8EE' },
  { id: 'p2', nombre: 'Termo de acero inoxidable', icono: '◇', cantidad: 2, color: '#5DE2A1' },
  { id: 'p3', nombre: 'Mousepad Gamer XL', icono: '◈', cantidad: 3, color: '#96A4FF' },
  { id: 'p4', nombre: 'Kit de stickers + audífonos', icono: '✦', cantidad: 4, color: '#F0C65B' },
  { id: 'p5', nombre: 'Trofeo Vibecode 2026', icono: '◆', cantidad: 1, color: '#FF7B8A' }
];

function buildDefaultProgresos(): Record<PostaId, ProgresoPosta> {
  return {
    1: { postaId: 1, estado: 'pendiente' },
    2: { postaId: 2, estado: 'pendiente' },
    3: { postaId: 3, estado: 'pendiente' },
    4: { postaId: 4, estado: 'pendiente' },
    5: { postaId: 5, estado: 'pendiente' }
  };
}

function normalizeProgress(progress: unknown, postaId: PostaId): ProgresoPosta {
  if (!progress || typeof progress !== 'object') {
    return { postaId, estado: 'pendiente' };
  }

  const value = progress as Partial<ProgresoPosta>;
  const estado = value.estado === 'completado' || value.estado === 'en_progreso' ? value.estado : 'pendiente';

  return {
    postaId,
    estado,
    completadoEn: value.completadoEn,
    tiempoSegundos: value.tiempoSegundos,
    score: value.score,
    detalles: value.detalles
  };
}

function normalizeEquipo(value: Partial<Equipo>, index = 0): Equipo {
  const id = String(value.id ?? '').trim();
  const progress = (value.progresos ?? {}) as Record<number, unknown>;
  const postaInicial = Number(value.postaInicial);
  const safePostaInicial = [1, 2, 3, 4, 5].includes(postaInicial) ? (postaInicial as PostaId) : (((index % 5) + 1) as PostaId);

  return {
    id,
    nombre: String(value.nombre ?? `Equipo ${id}`),
    members: Array.isArray(value.members) ? value.members.map(String).filter(Boolean) : [],
    active: value.active !== false,
    postaInicial: safePostaInicial,
    progresos: {
      1: normalizeProgress(progress[1], 1),
      2: normalizeProgress(progress[2], 2),
      3: normalizeProgress(progress[3], 3),
      4: normalizeProgress(progress[4], 4),
      5: normalizeProgress(progress[5], 5)
    },
    creadoEn: String(value.creadoEn ?? new Date().toISOString())
  };
}

function createDefaultEquipos(): Equipo[] {
  return EQUIPOS_INICIALES_DEFAULT.map((equipo, index) =>
    normalizeEquipo(
      {
        ...equipo,
        members: [],
        active: true,
        progresos: buildDefaultProgresos(),
        creadoEn: new Date(Date.now() - (EQUIPOS_INICIALES_DEFAULT.length - index) * 60_000).toISOString()
      },
      index
    )
  );
}

let channel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    channel = null;
  }
}

export function notifyChange(): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event('vibecode_data_updated'));
  channel?.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
}

export function subscribeToChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handleLocalEvent = () => callback();
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'DATA_UPDATED') callback();
  };

  window.addEventListener('vibecode_data_updated', handleLocalEvent);
  channel?.addEventListener('message', handleBroadcast);

  return () => {
    window.removeEventListener('vibecode_data_updated', handleLocalEvent);
    channel?.removeEventListener('message', handleBroadcast);
  };
}

export function getEquipos(): Equipo[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY_EQUIPOS);
    if (!raw) {
      const defaults = createDefaultEquipos();
      localStorage.setItem(STORAGE_KEY_EQUIPOS, JSON.stringify(defaults));
      return defaults;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((equipo, index) => normalizeEquipo(equipo, index)).filter((equipo) => equipo.id.length > 0);
  } catch {
    return [];
  }
}

export function getEquipoById(id: string): Equipo | null {
  return getEquipos().find((equipo) => equipo.id === id) ?? null;
}

export function saveEquipos(equipos: Equipo[], broadcast = true): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_EQUIPOS, JSON.stringify(equipos.map((equipo, index) => normalizeEquipo(equipo, index))));
    if (broadcast) notifyChange();
  } catch {
    // localStorage puede estar bloqueado en navegadores con almacenamiento deshabilitado.
  }
}

export function hydrateRemoteTeams(remoteTeams: RemoteTeam[]): Equipo[] {
  const currentById = new Map(getEquipos().map((equipo) => [equipo.id, equipo]));
  const hydrated = remoteTeams.map((remote, index) => {
    const current = currentById.get(remote.id);
    return normalizeEquipo(
      {
        id: remote.id,
        nombre: remote.name,
        members: remote.members,
        active: remote.active,
        postaInicial: current?.postaInicial ?? (((index % 5) + 1) as PostaId),
        progresos: current?.progresos ?? buildDefaultProgresos(),
        creadoEn: current?.creadoEn ?? remote.created_at
      },
      index
    );
  });

  saveEquipos(hydrated, false);
  return hydrated;
}

export function registrarOCrearEquipo(id: string, nombreCustom?: string, members: string[] = []): Equipo {
  const equipos = getEquipos();
  const existente = equipos.find((equipo) => equipo.id === id);
  if (existente) return existente;

  const nuevoEquipo = normalizeEquipo({
    id,
    nombre: nombreCustom?.trim() || `Equipo ${id}`,
    members,
    active: true,
    postaInicial: (((equipos.length % 5) + 1) as PostaId),
    progresos: buildDefaultProgresos(),
    creadoEn: new Date().toISOString()
  }, equipos.length);

  saveEquipos([...equipos, nuevoEquipo]);
  return nuevoEquipo;
}

export function actualizarDatosEquipo(
  equipoId: string,
  changes: Partial<Pick<Equipo, 'nombre' | 'members' | 'active'>>
): Equipo | null {
  const equipos = getEquipos();
  const index = equipos.findIndex((equipo) => equipo.id === equipoId);
  if (index === -1) return null;

  const updated = normalizeEquipo({ ...equipos[index], ...changes }, index);
  equipos[index] = updated;
  saveEquipos(equipos);
  return updated;
}

export function completarPostaEquipo(
  equipoId: string,
  postaId: PostaId,
  score?: number,
  tiempoSegundos?: number,
  detalles?: string
): Equipo | null {
  const equipos = getEquipos();
  const index = equipos.findIndex((equipo) => equipo.id === equipoId);
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
  const index = equipos.findIndex((equipo) => equipo.id === equipoId);
  if (index === -1) return null;

  equipos[index].progresos = buildDefaultProgresos();
  saveEquipos(equipos);
  return equipos[index];
}

export function resetearTodoElEvento(): void {
  const equipos = getEquipos().map((equipo) => ({ ...equipo, progresos: buildDefaultProgresos() }));
  saveEquipos(equipos);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_SORTEOS);
    notifyChange();
  }
}

export function getPremios(): Premio[] {
  if (typeof window === 'undefined') return PREMIOS_DEFAULT;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREMIOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PREMIOS, JSON.stringify(PREMIOS_DEFAULT));
      return PREMIOS_DEFAULT;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : PREMIOS_DEFAULT;
  } catch {
    return PREMIOS_DEFAULT;
  }
}

export function savePremios(premios: Premio[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PREMIOS, JSON.stringify(premios));
  notifyChange();
}

export function getSorteos(): SorteoResultado[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SORTEOS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function registrarGanador(equipoId: string, equipoNombre: string, premioNombre: string): SorteoResultado {
  const sorteos = getSorteos();
  const nuevo: SorteoResultado = {
    id: `s_${Date.now()}`,
    equipoId,
    equipoNombre,
    premioNombre,
    fecha: new Date().toLocaleTimeString()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SORTEOS, JSON.stringify([nuevo, ...sorteos]));
    notifyChange();
  }

  return nuevo;
}
