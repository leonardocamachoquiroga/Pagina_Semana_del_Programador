import type { Posta, PostaId, Equipo, ProgresoPosta } from '../types/game';

export const POSTAS: Posta[] = [
  {
    id: 1,
    titulo: 'Speedtest de Código',
    encargado: 'Gadiel',
    tipo: 'speedtest',
    descripcion: 'Transcribe y resuelve algoritmos lo más rápido posible con alta precisión.',
    pin: '1001',
    instrucciones: [
      'Visualiza el snippet de código en la pantalla de TV.',
      'Transcribe el código en el editor minimizando errores tipográficos.',
      'Al presionar Enviar, el temporizador medirá tus WPM y precisión.'
    ]
  },
  {
    id: 2,
    titulo: 'Bloques de Wendo',
    encargado: 'Carla',
    tipo: 'wendo',
    descripcion: 'Demuestra tu agilidad en el reto físico de ensamble de bloques Wendo.',
    pin: '1002',
    instrucciones: [
      'Sigue la estructura demostrada por Carla en el módulo físico.',
      'Sincroniza a tu equipo para armar el patrón en el menor tiempo.',
      'Solicita al moderador validar el código al culminar el reto.'
    ]
  },
  {
    id: 3,
    titulo: 'Tema Página Web',
    encargado: 'Juanma',
    tipo: 'webdesign',
    descripcion: 'Definición conceptual y wireframing expreso de arquitectura web.',
    pin: '1003',
    instrucciones: [
      'Recibe el requerimiento conceptual planteado por Juanma.',
      'Discute la estructura visual, UX y secciones clave en 10 minutos.',
      'Presenta el wireframe/propuesta al encargado para obtener la clave.'
    ]
  },
  {
    id: 4,
    titulo: 'Encuentra el Error',
    encargado: 'Saul',
    tipo: 'bughunt',
    descripcion: 'Detecta bugs lógicos y sintácticos en código en tiempo récord.',
    pin: '1004',
    instrucciones: [
      'Examina los bloques de código presentados en la pantalla de TV.',
      'Identifica exactamente las líneas con errores sintácticos o de lógica.',
      'Selecciona los bugs correctos antes de agotar el tiempo.'
    ]
  },
  {
    id: 5,
    titulo: 'Juegos Lógicos (Hanoi)',
    encargado: 'Adro',
    tipo: 'hanoi',
    descripcion: 'Resuelve el acertijo lógico interactivo de la Torre de Hanoi en la TV.',
    pin: '1005',
    instrucciones: [
      'Mueve la torre de discos hacia el poste de destino.',
      'No puedes colocar un disco más grande sobre uno más pequeño.',
      'Completa el puzzle en la menor cantidad de movimientos.'
    ]
  }
];

export const MASTER_PIN = 'ADMIN2026';

/**
 * Obtiene la secuencia circular de postas para un equipo comenzando en su postaInicial.
 */
export function getSecuenciaPostas(postaInicial: PostaId): PostaId[] {
  const secuencia: PostaId[] = [];
  let actual = postaInicial;
  for (let i = 0; i < 5; i++) {
    secuencia.push(actual);
    actual = (actual % 5 + 1) as PostaId;
  }
  return secuencia;
}

/**
 * Determina la posta activa actual (siguiente misión) para un equipo.
 * Retorna null si el equipo completó las 5 postas.
 */
export function getSiguientePosta(equipo: Equipo): Posta | null {
  const secuencia = getSecuenciaPostas(equipo.postaInicial);
  for (const id of secuencia) {
    const progreso = equipo.progresos[id];
    if (!progreso || progreso.estado !== 'completado') {
      return POSTAS.find((p) => p.id === id) || null;
    }
  }
  return null;
}

/**
 * Cuenta cuántas postas ha completado el equipo (0 a 5).
 */
export function getPostasCompletadasCount(equipo: Equipo): number {
  return Object.values(equipo.progresos).filter((p) => p.estado === 'completado').length;
}

/**
 * Verifica si el equipo ha completado el 100% (5/5).
 */
export function esEquipoCompletado(equipo: Equipo): boolean {
  return getPostasCompletadasCount(equipo) === 5;
}
