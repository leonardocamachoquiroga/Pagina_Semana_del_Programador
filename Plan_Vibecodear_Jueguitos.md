# Plan de Desarrollo: "Postas de 10 min - Vibecodear Jueguitos"

Este documento detalla el plan de acción, arquitectura, diseño y requerimientos técnicos para desarrollar la plataforma del evento "Vibecodear Jueguitos" utilizando el framework Astro.

## 1. Sistema de Diseño (Extraído de NODE / sistemas-ucb.org)

Para mantener la misma línea visual de la página del centro de estudiantes, se aplicarán los siguientes patrones de UI/UX:

### 1.1 Patrones Visuales y Elementos UI
*   **Títulos con acentos (Spans):** Uso de `<h2>` donde palabras clave están resaltadas con un color de acento (ej. `<h2>En Sistemas <span>te escuchamos</span></h2>`).
*   **Decoradores de Puntos:** Implementación del patrón `<span>●</span><span>●</span><span>●</span>` utilizado como divisor y elemento decorativo en el encabezado y pie de página.
*   **Tarjetas (Cards) Numeradas:** Diseño de contenedores con esquinas redondeadas y números decorativos grandes opacos (ej. `01`, `02`) en la parte superior izquierda, ideal para listar las postas.
*   **Pills / Badges:** Uso de etiquetas pequeñas con bordes redondeados para estados (ej. "Completado", "Pendiente") o roles.
*   **Layout Limpio:** Uso de contenedores con ancho máximo, márgenes amplios y alternancia de fondos sutiles (secciones claras vs. secciones oscuras con texto invertido).

### 1.2 Stack Tecnológico Propuesto
*   **Framework Principal:** Astro (Ideal para sitios estáticos rápidos e interactividad por islas).
*   **Estilos:** Tailwind CSS (Recomendado para replicar rápidamente el diseño y los layouts de tarjetas flex/grid de la página original).
*   **Interactividad (Islas):** React, Svelte o Vanilla JS (Para los cronómetros, juegos como la Torre de Hanoi y la Ruleta de premios).
*   **Gestión de Estado Ligera:** NanoStores (Para compartir el estado global de completitud de los equipos si no se usa una base de datos) o Supabase/Firebase si se necesita sincronización en tiempo real.

---

## 2. Arquitectura y Flujo de la Aplicación

El sistema requiere un estricto control de acceso para evitar que los equipos se salten pasos o jueguen desde sus propios dispositivos. 

### 2.1 Roles y Vistas

1.  **Vista de Equipo (Panel de Completitud):** 
    *   *Ruta:* `/equipo/[id-equipo]`
    *   *Acceso:* Exclusivo para el equipo (desde sus celulares).
    *   *Funcionalidad:* Muestra el progreso (Postas completadas vs. pendientes). **NO** contiene los juegos. Muestra hacia qué posta deben dirigirse a continuación.
2.  **Vista de TV / Juego:**
    *   *Ruta:* `/tv/[nombre-juego]`
    *   *Acceso:* Solo se muestra en los monitores/televisores controlados por el centro.
    *   *Funcionalidad:* Pantalla interactiva donde el equipo realiza la prueba técnica (Ej. Speedtest, Encuentra el error).
3.  **Panel de Moderador (Encargado):**
    *   *Ruta:* `/moderador` (Protegida)
    *   *Funcionalidad:* Al terminar un equipo en una TV, el moderador ingresa un **código de validación** al perfil del equipo para marcar la posta como completada y asignarle la siguiente estación al azar (evitando aglomeraciones).
4.  **Vista de Ruleta Final:**
    *   *Ruta:* `/ruleta-premios`
    *   *Funcionalidad:* Carga dinámicamente solo a los equipos que tienen el 100% de completitud. Permite añadir `N` premios y sortear al ganador de manera interactiva.

---

## 3. Detalle de las Postas (Actividades)

| Posta | Título | Encargado | Requerimiento Digital |
| :--- | :--- | :--- | :--- |
| **1** | **Speedtest de Código** | Gadiel | App en TV: Panel con un snippet de código. El equipo debe transcribirlo/programar el algoritmo lo más rápido posible. Leaderboard local y temporizador regresivo. |
| **2** | **Bloques de Wendo** | Carla | Ninguno (Físico). Solo requiere un botón de validación (check) en el panel del moderador al superar el reto físico. |
| **3** | **Tema Página Web** | Juanma | Ninguno (Conceptual/Físico). Check de completitud en el sistema por parte del moderador. |
| **4** | **Encuentra el Error** | Saul | App en TV: Pantalla con varios paneles de código defectuoso. El equipo debe analizar visualmente y seleccionar (o apuntar) dónde está el bug lógico/sintáctico. |
| **5** | **Juegos Lógicos** | Adro | App en TV: Interfaz programada para juegos estilo "Torre de Hanoi" u otros puzzles interactivos a nivel software (además de los cubos físicos). |

---

## 4. Lógica de Enrutamiento y "Anti-Cuellos de Botella"

Para evitar que los 10 equipos vayan a la Posta 1 al mismo tiempo, el sistema implementará un algoritmo de asignación de ruta circular:

*   **Equipo A:** Inicia en Posta 1 -> Luego 2 -> 3 -> 4 -> 5.
*   **Equipo B:** Inicia en Posta 3 -> Luego 4 -> 5 -> 1 -> 2.
*   **Equipo C:** Inicia en Posta 5 -> Luego 1 -> 2 -> 3 -> 4.

El *Panel de Completitud* del equipo no les mostrará la lista entera como un menú para elegir, sino como un **"Next Step"**: 
> *"Misión actual: Ve a la estación de Bloques de Wendo (Posta 2) con Carla."*

Una vez que Carla ingresa el código de victoria, la pantalla del celular del equipo se actualiza a la siguiente misión.

---

## 5. Plan de Ejecución (Milestones)

1.  **Semana 1: Setup y UI Core**
    *   Inicializar proyecto en Astro (`npm create astro@latest`).
    *   Configurar Tailwind CSS y replicar los componentes core (Títulos decorados, divisores `●●●`, cards numéricas, fuente sans-serif de UCB).
2.  **Semana 2: Juegos y Televisores (Islas interactivas)**
    *   Programar componente interactivo de *Speedtest* (JS timer + Input validation).
    *   Programar panel de selección para *Encuentra el Error*.
    *   Programar o integrar la *Torre de Hanoi*.
3.  **Semana 3: Lógica de Estado y Paneles**
    *   Desarrollar panel móvil de Completitud de los equipos.
    *   Crear formulario secreto para los moderadores (ingreso de código y asignación de siguiente posta).
4.  **Semana 4: La Ruleta y Cierre**
    *   Construir componente Canvas o CSS Animation para la Ruleta de premios.
    *   Conectar filtro: `Equipos.filter(eq => eq.postas.length === 5)` para popular la ruleta.
    *   Despliegue a producción (Vercel / Netlify) en dominio o subdominio.
