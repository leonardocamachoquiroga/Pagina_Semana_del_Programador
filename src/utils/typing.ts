export type TypingDifficulty = 'facil' | 'intermedio' | 'dificil';

export const TYPING_DIFFICULTIES: Array<{ id: TypingDifficulty; label: string }> = [
  { id: 'facil', label: 'Fácil' },
  { id: 'intermedio', label: 'Intermedio' },
  { id: 'dificil', label: 'Difícil' }
];

export interface TypingTest {
  dificultad: TypingDifficulty;
  titulo: string;
  code: string;
}

export interface TypingLanguage {
  id: number;
  lenguaje: string;
  pruebas: TypingTest[];
}

export const TYPING_LANGUAGES: TypingLanguage[] = [
  {
    id: 1,
    lenguaje: 'JavaScript',
    pruebas: [
      {
        dificultad: 'facil',
        titulo: 'Primer mensaje',
        code: `const mensaje = 'Hola UCB';
console.log(mensaje);`
      },
      {
        dificultad: 'intermedio',
        titulo: 'Filtrar notas aprobadas',
        code: `const notas = [78, 42, 91, 65];
const aprobados = notas.filter((nota) => nota >= 51);
console.log(aprobados.length);`
      },
      {
        dificultad: 'dificil',
        titulo: 'Filtro y mapeo de estudiantes UCB',
        code: `const estudiantes = Array.from({ length: 10 });
const aprobados = estudiantes
  .filter(std => std.nota >= 51)
  .map(std => ({ ...std, estado: 'APROBADO' }));
console.log('Total aprobados:', aprobados.length);`
      }
    ]
  },
  {
    id: 2,
    lenguaje: 'Python',
    pruebas: [
      {
        dificultad: 'facil',
        titulo: 'Saludo inicial',
        code: `nombre = 'UCB'
print(nombre)`
      },
      {
        dificultad: 'intermedio',
        titulo: 'Contar notas aprobadas',
        code: `notas = [78, 42, 91, 65]
aprobadas = [nota for nota in notas if nota >= 51]
print(len(aprobadas))`
      },
      {
        dificultad: 'dificil',
        titulo: 'Búsqueda binaria de hackathon',
        code: `def busqueda_binaria(arr, x):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == x: return mid
        elif arr[mid] < x: low = mid + 1
        else: high = mid - 1
    return -1`
      }
    ]
  },
  {
    id: 3,
    lenguaje: 'TypeScript',
    pruebas: [
      {
        dificultad: 'facil',
        titulo: 'Contar equipos',
        code: `const equipos: string[] = ['UCB'];
console.log(equipos.length);`
      },
      {
        dificultad: 'intermedio',
        titulo: 'Filtrar equipos activos',
        code: `const equipos = ['UCB', 'ByteForce'];
const activos = equipos.filter(Boolean);
console.log(activos.length);`
      },
      {
        dificultad: 'dificil',
        titulo: 'Algoritmo de rutas circulares',
        code: `interface Equipo { id: string; postaInicial: number; }
function getNextPosta(current: number): number {
    return (current % 5) + 1;
}`
      }
    ]
  }
];
