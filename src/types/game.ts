export type PostaId = 1 | 2 | 3 | 4 | 5;

export type TipoPosta = 'speedtest' | 'wendo' | 'webdesign' | 'bughunt' | 'hanoi';

export interface Posta {
  id: PostaId;
  titulo: string;
  encargado: string;
  tipo: TipoPosta;
  descripcion: string;
  pin: string;
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
  id: string; // ID de 4 dígitos (ej: "1462", "6462")
  nombre: string;
  postaInicial: PostaId;
  progresos: Record<PostaId, ProgresoPosta>;
  creadoEn: string;
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
