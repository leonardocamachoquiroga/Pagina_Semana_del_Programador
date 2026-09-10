import type { Equipo, Posta, PostaId } from '../types/game';

export const POSTAS: Posta[] = [
  {
    id: 1,
    titulo: 'Speedtest de Código',
    encargado: 'Gadiel',
    tipo: 'speedtest',
    categoria: 'Código',
    descripcion: 'Transcribe un snippet con velocidad, atención y precisión.',
    duracionMinutos: 10,
    jugadores: 'Equipo completo',
    accent: 'cyan',
    instrucciones: [
      'Visualiza el snippet de código asignado.',
      'Transcribe el código en el editor minimizando errores tipográficos.',
      'Al completar, solicita al moderador validar el resultado.'
    ]
  },
  {
    id: 2,
    titulo: 'Bloques de Wendo',
    encargado: 'Carla',
    tipo: 'wendo',
    categoria: 'Reto físico',
    descripcion: 'Coordina a tu equipo para construir el patrón de bloques en el menor tiempo.',
    duracionMinutos: 10,
    jugadores: 'Equipo completo',
    accent: 'amber',
    instrucciones: [
      'Sigue la estructura demostrada en la estación física.',
      'Sincroniza a tu equipo para armar el patrón.',
      'Solicita al encargado validar la construcción terminada.'
    ]
  },
  {
    id: 3,
    titulo: 'Tema: Página Web',
    encargado: 'Juanma',
    tipo: 'webdesign',
    categoria: 'Diseño y UX',
    descripcion: 'Define una arquitectura web y un wireframe expreso a partir de un problema real.',
    duracionMinutos: 10,
    jugadores: 'Equipo completo',
    accent: 'indigo',
    instrucciones: [
      'Recibe el requerimiento conceptual del encargado.',
      'Discute la estructura visual, UX y secciones clave.',
      'Presenta la propuesta al encargado para obtener la validación.'
    ]
  },
  {
    id: 4,
    titulo: 'Encuentra el Error',
    encargado: 'Saul',
    tipo: 'bughunt',
    categoria: 'Debugging',
    descripcion: 'Detecta bugs lógicos y sintácticos en código en tiempo récord.',
    duracionMinutos: 10,
    jugadores: 'Equipo completo',
    accent: 'critical',
    instrucciones: [
      'Examina los bloques de código presentados.',
      'Identifica exactamente las líneas con errores.',
      'Selecciona los bugs correctos antes de validar.'
    ]
  },
  {
    id: 5,
    titulo: 'Torre de Hanoi',
    encargado: 'Adro',
    tipo: 'hanoi',
    categoria: 'Lógica',
    descripcion: 'Resuelve el puzzle de la Torre de Hanoi con la menor cantidad de movimientos.',
    duracionMinutos: 10,
    jugadores: 'Equipo completo',
    accent: 'success',
    instrucciones: [
      'Comienza con todos los discos ordenados en la Torre 1.',
      'Usa la Torre 2 como auxiliar y mueve solo un disco válido por turno.',
      'Nunca coloques un disco grande sobre uno más pequeño.',
      'La victoria ocurre únicamente cuando todos los discos llegan a la Torre 3.'
    ]
  }
];

// Solo se usa como compatibilidad para el modo local/offline. La administración remota usa MODERATOR_PIN.
export function getSecuenciaPostas(postaInicial: PostaId): PostaId[] {
  const secuencia: PostaId[] = [];
  let actual = postaInicial;

  for (let i = 0; i < POSTAS.length; i += 1) {
    secuencia.push(actual);
    actual = (actual % POSTAS.length + 1) as PostaId;
  }

  return secuencia;
}

export function getSiguientePosta(equipo: Equipo): Posta | null {
  const secuencia = getSecuenciaPostas(equipo.postaInicial);

  for (const id of secuencia) {
    const progreso = equipo.progresos[id];
    if (!progreso || progreso.estado !== 'completado') {
      return POSTAS.find((posta) => posta.id === id) ?? null;
    }
  }

  return null;
}

export function getPostasCompletadasCount(equipo: Equipo): number {
  return POSTAS.filter((posta) => equipo.progresos[posta.id]?.estado === 'completado').length;
}

export function esEquipoCompletado(equipo: Equipo): boolean {
  return getPostasCompletadasCount(equipo) === POSTAS.length;
}
