export type PostaId = 1 | 2 | 3 | 4 | 5;

export type TipoPosta = 'speedtest' | 'wendo' | 'webdesign' | 'bughunt' | 'hanoi';

export type PostaAccent = 'cyan' | 'indigo' | 'amber' | 'critical' | 'success';

export interface Posta {
  id: PostaId;
  titulo: string;
  encargado: string;
  tipo: TipoPosta;
  categoria: string;
  descripcion: string;
  duracionMinutos: number;
  jugadores: string;
  accent: PostaAccent;
  instrucciones: string[];
}

export type EstadoPosta = 'pendiente' | 'en_progreso' | 'completado';

export interface ProgresoPosta {
  postaId: PostaId;
  estado: EstadoPosta;
  completadoEn?: string;
  tiempoSegundos?: number;
  score?: number;
  detalles?: string;
}

export interface Equipo {
  id: string;
  nombre: string;
  members: string[];
  active: boolean;
  postaInicial: PostaId;
  progresos: Record<PostaId, ProgresoPosta>;
  creadoEn: string;
}

export interface RemoteTeam {
  id: string;
  name: string;
  members: string[];
  active: boolean;
  created_at: string;
}

export interface Premio {
  id: string;
  nombre: string;
  icono: string;
  cantidad: number;
  color: string;
}

export interface SorteoResultado {
  id: string;
  equipoId: string;
  equipoNombre: string;
  premioNombre: string;
  fecha: string;
}
