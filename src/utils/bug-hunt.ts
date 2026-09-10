export type BugDifficulty = 'facil' | 'intermedio' | 'dificil';
export type BugLanguageId = 'javascript' | 'cpp' | 'typescript';

export const BUG_DIFFICULTIES: Array<{ id: BugDifficulty; label: string }> = [
  { id: 'facil', label: 'Fácil' },
  { id: 'intermedio', label: 'Intermedio' },
  { id: 'dificil', label: 'Difícil' }
];

export const BUG_LANGUAGES: Array<{ id: BugLanguageId; label: string }> = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'cpp', label: 'C++' },
  { id: 'typescript', label: 'TypeScript' }
];

export interface CodeBugLine {
  lineNum: number;
  code: string;
  isBug: boolean;
  explanation?: string;
}

export interface CodeBugChallenge {
  titulo: string;
  lenguaje: string;
  lines: CodeBugLine[];
}

type BugChallengesByDifficulty = Record<BugDifficulty, CodeBugChallenge>;

export const BUG_CHALLENGES: Record<BugLanguageId, BugChallengesByDifficulty> = {
  javascript: {
    facil: {
      titulo: 'Comprobar si un número es par',
      lenguaje: 'JavaScript',
      lines: [
        { lineNum: 1, code: 'function esPar(numero) {', isBug: false },
        { lineNum: 2, code: '  return numero % 2 === 1;', isBug: true, explanation: 'Un número par deja residuo 0, no 1.' },
        { lineNum: 3, code: '}', isBug: false }
      ]
    },
    intermedio: {
      titulo: 'Sumar notas aprobadas',
      lenguaje: 'JavaScript',
      lines: [
        { lineNum: 1, code: 'function sumarAprobados(notas) {', isBug: false },
        { lineNum: 2, code: '  const aprobados = notas', isBug: false },
        { lineNum: 3, code: '    .filter((nota) => nota >= 51)', isBug: false },
        { lineNum: 4, code: '    .map((nota) => ({ nota, aprobado: true }));', isBug: false },
        { lineNum: 5, code: '  return aprobados.reduce((total, item) => total + item.nota, 1);', isBug: true, explanation: 'La suma debe comenzar en 0; con 1 se agrega un punto extra.' },
        { lineNum: 6, code: '}', isBug: false }
      ]
    },
    dificil: {
      titulo: 'Bucle infinito en servidor de notas',
      lenguaje: 'JavaScript',
      lines: [
        { lineNum: 1, code: 'function calcularPromedio(notas) {', isBug: false },
        { lineNum: 2, code: '  let total = 0;', isBug: false },
        { lineNum: 3, code: '  for (let i = 0; i <= notas.length; i++) {', isBug: true, explanation: 'Off-by-one: el último acceso usa un índice inexistente.' },
        { lineNum: 4, code: '    total += notas[i];', isBug: false },
        { lineNum: 5, code: '  }', isBug: false },
        { lineNum: 6, code: '  return total / notas.length;', isBug: false },
        { lineNum: 7, code: '}', isBug: false }
      ]
    }
  },
  cpp: {
    facil: {
      titulo: 'Comprobar mayoría de edad',
      lenguaje: 'C++',
      lines: [
        { lineNum: 1, code: '#include <iostream>', isBug: false },
        { lineNum: 2, code: 'int main() {', isBug: false },
        { lineNum: 3, code: '  int edad = 20;', isBug: false },
        { lineNum: 4, code: '  if (edad < 18) std::cout << "Puede participar";', isBug: true, explanation: 'Una persona de 18 años o más cumple la condición.' },
        { lineNum: 5, code: '}', isBug: false }
      ]
    },
    intermedio: {
      titulo: 'Sumar valores positivos',
      lenguaje: 'C++',
      lines: [
        { lineNum: 1, code: '#include <iostream>', isBug: false },
        { lineNum: 2, code: 'int sumarPositivos(const int valores[], int cantidad) {', isBug: false },
        { lineNum: 3, code: '  int total = 0;', isBug: false },
        { lineNum: 4, code: '  for (int i = 0; i <= cantidad; ++i) {', isBug: true, explanation: 'El último índice válido es cantidad - 1; el límite debe ser menor.' },
        { lineNum: 5, code: '    if (valores[i] > 0) total += valores[i];', isBug: false },
        { lineNum: 6, code: '  }', isBug: false },
        { lineNum: 7, code: '  return total;', isBug: false },
        { lineNum: 8, code: '}', isBug: false }
      ]
    },
    dificil: {
      titulo: 'Fuga de memoria y puntero nulo',
      lenguaje: 'C++',
      lines: [
        { lineNum: 1, code: '#include <iostream>', isBug: false },
        { lineNum: 2, code: 'int* crearArreglo() {', isBug: false },
        { lineNum: 3, code: '  int arr[5] = {10, 20, 30, 40, 50};', isBug: false },
        { lineNum: 4, code: '  return arr;', isBug: true, explanation: 'Retorna un puntero a una variable local destruida al salir.' },
        { lineNum: 5, code: '}', isBug: false },
        { lineNum: 6, code: 'int main() { int* p = crearArreglo(); std::cout << p[0]; }', isBug: false }
      ]
    }
  },
  typescript: {
    facil: {
      titulo: 'Mostrar el nombre del equipo',
      lenguaje: 'TypeScript',
      lines: [
        { lineNum: 1, code: "const nombre: string = 'UCB';", isBug: false },
        { lineNum: 2, code: 'console.log(nombre.toUpperCase);', isBug: true, explanation: 'Para ejecutar el método hace falta llamar a toUpperCase().' },
        { lineNum: 3, code: 'console.log(nombre);', isBug: false }
      ]
    },
    intermedio: {
      titulo: 'Listar equipos activos',
      lenguaje: 'TypeScript',
      lines: [
        { lineNum: 1, code: 'type Equipo = { nombre: string; activo: boolean };', isBug: false },
        { lineNum: 2, code: 'function listarActivos(equipos: Equipo[]): string[] {', isBug: false },
        { lineNum: 3, code: '  const nombres = equipos', isBug: false },
        { lineNum: 4, code: '    .filter((equipo) => !equipo.activo)', isBug: true, explanation: 'Para listar activos se debe conservar equipo.activo, no negarlo.' },
        { lineNum: 5, code: '    .map((equipo) => equipo.nombre);', isBug: false },
        { lineNum: 6, code: '  return nombres;', isBug: false },
        { lineNum: 7, code: '}', isBug: false }
      ]
    },
    dificil: {
      titulo: 'Inmutabilidad de estado en React',
      lenguaje: 'TypeScript',
      lines: [
        { lineNum: 1, code: 'const [items, setItems] = useState<string[]>([]);', isBug: false },
        { lineNum: 2, code: 'function agregarItem(nuevo: string) {', isBug: false },
        { lineNum: 3, code: '  items.push(nuevo);', isBug: true, explanation: 'Mutación directa del arreglo de estado.' },
        { lineNum: 4, code: '  setItems(items);', isBug: true, explanation: 'Se conserva la misma referencia y puede no existir un re-render.' },
        { lineNum: 5, code: '}', isBug: false }
      ]
    }
  }
};
