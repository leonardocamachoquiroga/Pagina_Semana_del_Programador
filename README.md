# Día del Programador · Ingeniería de Sistemas UCB

Aplicación presencial de juegos para el Día del Programador de Ingeniería de Sistemas de la Universidad Católica Boliviana. Un operador abre cada estación desde una computadora; esa computadora puede duplicarse a un proyector o televisión sin sincronización remota.

## Experiencias

- **Posta 01 · Speedtest de Código:** transcripción de snippets con tiempo, WPM y precisión.
- **Posta 02 · Bloques de Wendo:** cronómetro e instrucciones para el reto físico.
- **Posta 03 · Tema: Página Web:** briefs de diseño y UX con timer.
- **Posta 04 · Encuentra el Error:** selección y evaluación de líneas con bugs.
- **Posta 05 · Torre de Hanoi:** puzzle interactivo de 3, 4 o 5 discos.
- **Gran final · Ruleta de premios:** sorteo local para equipos que completaron las cinco postas.

Todas las estaciones comparten navegación, reglas, reinicio, fullscreen, tipografía, estados y feedback. Los juegos y el progreso local continúan funcionando aunque Supabase o Internet no estén disponibles.

## Rutas

| Ruta | Uso |
| --- | --- |
| `/` | Portada y mapa de estaciones. |
| `/tv` | Lanzador operativo de estaciones. |
| `/tv/[posta]` | Acceso directo a una posta concreta. |
| `/equipo` | Consulta de ruta y progreso por ID. |
| `/equipo/[id]` | Consulta directa de un equipo. |
| `/moderador` | Registro, edición, activación e importación de equipos. |
| `/ruleta` | Gran final y registro local de ganadores. |

## Instalación

Requisitos: Node.js `>=22.12.0`.

```bash
npm ci
npx astro check
npm run build
npx astro dev --background
```

El puerto por defecto es `4321`. Si ese puerto está ocupado, Astro puede iniciarse con `--port 4322`.

## Variables de entorno

Duplica `.env.example` como `.env.local` y completa:

```bash
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only-secret-or-service-role-key>
MODERATOR_PIN=<pin-privado-del-operador>
MODERATOR_SESSION_SECRET=<secreto-largo-aleatorio>
```

Las dos variables `PUBLIC_` pueden llegar al navegador. `SUPABASE_SERVICE_ROLE_KEY`, `MODERATOR_PIN` y `MODERATOR_SESSION_SECRET` son únicamente del servidor y nunca deben incluirse en código cliente, commits o capturas.

Sin estas variables, la aplicación usa un catálogo local de respaldo. La administración remota requiere `SUPABASE_SERVICE_ROLE_KEY` y una sesión de operador válida.

En Vercel, configura las mismas cinco variables en **Project Settings → Environment Variables** para los entornos que vayas a utilizar. `SUPABASE_SERVICE_ROLE_KEY`, `MODERATOR_PIN` y `MODERATOR_SESSION_SECRET` deben quedar sin prefijo `PUBLIC_` y no deben exponerse al navegador.

## Supabase

El proyecto remoto ya está vinculado y la migración inicial está aplicada:

```text
supabase/migrations/20260909190000_create_teams.sql
```

La tabla `public.teams` contiene `id`, `name`, `members`, `active` y `created_at`. RLS permanece habilitado: el cliente público solo puede leer equipos activos; las escrituras pasan por `/api/teams` después de validar la sesión HMAC del operador.

Comandos útiles:

```bash
npx supabase migration list
npx supabase db push
npx supabase start       # requiere Docker para Supabase local
```

El panel de operador acepta alta manual y CSV con formato `id,nombre,integrantes`. Los integrantes pueden separarse por coma, punto y coma o salto de línea.

## Stack

- Astro 5 con adapter oficial de Vercel en modo server.
- React 18 para las islas interactivas.
- Tailwind 3 y un sistema visual CSS centralizado.
- `@supabase/supabase-js` y Supabase CLI como dependencia de desarrollo.
- `localStorage` + `BroadcastChannel` para progreso y coordinación local.
- Canvas 2D, Web Audio API y `canvas-confetti` únicamente en la ruleta.

No hay script de lint configurado; `npm test`, `astro check`, `tsc --noEmit`, el build y los smoke tests HTTP son las validaciones disponibles.
