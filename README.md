# 🚀 Vibecodear Jueguitos - Semana del Programador 2026 (UCB)

![Vibecodear Banner](https://img.shields.io/badge/UCB-Sistemas_NODE-002B49?style=for-the-badge&logo=astro&logoColor=FFC72C)
![Astro](https://img.shields.io/badge/Astro-v5.4.0-BC52EE?style=for-the-badge&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-v18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)

Plataforma web oficial para la gestión, seguimiento en tiempo real y competencias por **postas de 10 minutos** durante el evento **"Vibecodear Jueguitos"** en la Semana del Programador de la Universidad Católica Boliviana (UCB).

---

## 🎯 Características Principales

1. **Línea Gráfica UCB / NODE:** Títulos con acentos en `<span>`, divisores decorativos de puntos `● ● ●`, tarjetas numeradas (`01`, `02`, `03`...), badges de estado y diseño en modo oscuro neón.
2. **Identificación de Equipos por 4 Dígitos:** Cada equipo se registra e identifica mediante un código numérico de 4 dígitos (ej: `1462`, `6462`, `1024`), permitiendo la incorporación dinámica de nuevos competidores.
3. **Misión "Next Step" (Anti-Cuellos de Botella):** Algoritmo de enrutamiento circular que asigna diferentes estaciones de inicio a los equipos (ej: Equipo A inicia en Posta 1, Equipo B en Posta 3, etc.) para evitar aglomeraciones.
4. **Sincronización Multiventana Real-Time:** Integración de `BroadcastChannel API` + `localStorage` para actualizar en tiempo real los móviles de los competidores cuando un moderador o televisor valida un avance.
5. **5 Estaciones Interactivas en TV:**
   - **Posta 01: Speedtest de Código (Gadiel):** Medidor de velocidad de tipeo con WPM, precisión %, resaltado de sintaxis y temporizador.
   - **Posta 02: Bloques de Wendo (Carla):** Cronómetro visual de 10 min e instrucciones para el reto físico.
   - **Posta 03: Tema Página Web (Juanma):** Selector dinámico de proyectos UI/UX y plantilla conceptual.
   - **Posta 04: Encuentra el Error / Bug Hunt (Saul):** Desafío de depuración interactiva en código.
   - **Posta 05: Juegos Lógicos / Hanoi (Adro):** Acertijo interactivo de la Torre de Hanoi (3 a 5 discos) con físicas y validador de movimientos.
6. **Panel de Moderador:** Acceso protegido mediante PIN para validar códigos de victoria y gestionar la competencia.
7. **Ruleta de Premios Final:** Canvas 2D interactivo con físicas de giro, sonidos Web Audio API, lluvia de confeti y filtro exclusivo para equipos al 100% de completitud (5/5 postas).

---

## 🛣️ Estructura de Rutas

| Ruta | Descripción | Acceso |
| :--- | :--- | :--- |
| `/` | Landing page principal con accesos rápidos y grid de postas. | Público |
| `/equipo` | Portal móvil de competidores para buscar e ingresar por ID de 4 dígitos. | Equipos |
| `/equipo/[id]` | Dashboard personalizado del equipo (ej: `/equipo/1462`). | Equipos |
| `/tv` | Hub selector para las pantallas de televisores en las estaciones. | Pantallas TV |
| `/tv/[posta]` | Interfaz de juego específica para TV (ej: `/tv/1` al `/tv/5`). | Pantallas TV |
| `/moderador` | Panel de control, validación de misiones y gestión del evento. | Moderadores (PIN) |
| `/ruleta` | Ruleta de premios canvas para el sorteo final con confeti. | Proyección Evento |

---

## 🔑 Claves y PINs de Moderación

| Posta | Encargado | Tipo de Reto | PIN de Validación |
| :--- | :--- | :--- | :--- |
| **Posta 1** | Gadiel | Speedtest de Código | `1001` |
| **Posta 2** | Carla | Bloques de Wendo (Físico) | `1002` |
| **Posta 3** | Juanma | Tema Página Web | `1003` |
| **Posta 4** | Saul | Encuentra el Error (Bug Hunt) | `1004` |
| **Posta 5** | Adro | Juegos Lógicos (Hanoi) | `1005` |
| **Master PIN** | Administrador | Acceso General / Reset | `ADMIN2026` |

---

## 🛠️ Stack Tecnológico

- **Framework:** [Astro v5](https://astro.build/) (Arquitectura por islas).
- **UI & Islas:** React v18 + Lucide Icons.
- **Estilos:** Tailwind CSS v3 + CSS Variables UCB NODE.
- **Efectos & Canvas:** Canvas 2D API, Web Audio API, `canvas-confetti`.
- **Persistencia:** `localStorage` + `BroadcastChannel API`.

---

## 💻 Instalación y Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/leonardocamachoquiroga/Pagina_Semana_del_Programador.git
   cd Pagina_Semana_del_Programador
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Navega a `http://localhost:4321` en tu explorador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📜 Licencia y Créditos

Desarrollado para la **Semana del Programador 2026** por el Centro de Estudiantes de Ingeniería de Sistemas (NODE) - **Universidad Católica Boliviana "San Pablo"**.
