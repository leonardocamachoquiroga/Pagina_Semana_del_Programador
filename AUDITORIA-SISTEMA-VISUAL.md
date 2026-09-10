# Auditoría exhaustiva del sistema visual

## Handoff independiente para reconstruir la identidad visual de Ingeniería de Sistemas UCB

**Repositorio auditado:** Node Landing Page  
**Producto principal:** landing/web de Ingeniería de Sistemas de la Universidad Católica Boliviana, Cochabamba  
**Fecha de auditoría:** 2026-09-09  
**Revisión inspeccionada:** HEAD local 25c40d1  
**Alcance:** auditoría estática del frontend, estilos, componentes, rutas, assets, interacciones y responsive.  
**Cambios realizados durante la auditoría:** únicamente este documento Markdown. No se modificó ningún archivo de código, configuración, asset o dependencia.

---

## 1. Resumen ejecutivo

La identidad visual principal no es un cyberpunk saturado. Es una interfaz editorial y tecnológica de alto contraste, construida alrededor de:

- azul profundo/navy y superficies azul pizarra;
- cyan eléctrico como señal, acción y conexión;
- índigo como acento secundario;
- tipografía display condensada en mayúsculas para titulares;
- Montserrat para comunicación institucional;
- Geist monoespaciada para telemetría, código y metadatos;
- grids de blueprint, nodos, líneas, hexágonos y diagramas de conexión;
- superficies opacas y limpias, con blur y glow reservados para momentos concretos;
- una composición amplia, ordenada y con bastante espacio negativo;
- microinteracciones breves, funcionales y respetuosas de reduced motion.

La página se reconoce por parecer una combinación de sitio institucional, dashboard de producto y sistema técnico de ingeniería. La geometría comunica estructura; los nodos comunican comunidad y conexión; el cyan comunica actividad; los datos numerados comunican rigor.

La regla más importante para trasladar la identidad es:

> Construir una interfaz técnica sobria con señales de red y datos, no una ambientación de ciencia ficción llena de neón.

El repositorio contiene más de una capa visual. La landing principal de Ingeniería de Sistemas usa el sistema oscuro azul/cyan. La página secundaria del Centro de Estudiantes Node utiliza una subidentidad roja/blanca. El subsistema de Pensum utiliza una interfaz de datos clara e independiente. Las pantallas autenticadas de recursos, proyectos, badges y administración usan una versión de producto del mismo lenguaje. Estas capas deben distinguirse para no mezclar tokens que pertenecen a contextos diferentes.

---

## 2. Fuente de verdad y arquitectura visual real

### 2.1 Fuente de verdad

Para reconstruir la identidad actual, el orden de confianza es:

1. estilos y componentes que realmente se renderizan en las rutas públicas;
2. variables y utilidades de src/styles/global.css;
3. estilos locales de cada componente;
4. assets que aparecen en las páginas;
5. datos de src/lib/landing-data.ts;
6. documentación histórica.

docs/Styling.md describe una versión antigua centrada en el rojo del Centro de Estudiantes. El AGENTS.md aporta contexto de producto, pero no reemplaza la inspección del frontend actual. El archivo landing.md ya existía sin seguimiento y no se tomó como fuente de verdad de este handoff. Ninguno de esos documentos debe usarse para deducir los tokens de la landing principal cuando contradice al código actual.

### 2.2 Stack y estructura que afectan al diseño

- Framework: Astro.
- Renderizado: salida server con adaptador Node standalone.
- Estilos: Tailwind CSS v4 mediante tema CSS-first y utilidades en los componentes.
- No existe un tailwind.config tradicional que concentre el sistema. La mayor parte de los tokens está en global.css.
- Integración React: islas interactivas para autenticación, recursos, Hall of Systems, badges y administración.
- Fuentes cargadas globalmente: Montserrat, Bebas Neue y Geist Variable.
- Layout global: src/layouts/Layout.astro.
- Fondo geométrico global: HexagonBackground.tsx cargado como isla client:load.
- Navegación compartida: src/components/Navbar.astro.
- Footer compartido: src/components/Footer.astro.
- Landing principal: src/pages/index.astro.
- Página secundaria Node: src/pages/centro-estudiantes.astro.
- Pensum como producto de datos: src/styles/pensum.css y componentes de Pensum.

### 2.3 Mapa de rutas y peso visual

| Área | Función | Lenguaje visual dominante |
|---|---|---|
| / | Landing de Ingeniería de Sistemas | oscuro, cyan, índigo, blueprint, red de nodos |
| /centro-estudiantes | Micrositio electoral Node | blanco, rojo institucional, logo facetado, hexágonos |
| /pensum | Malla curricular interactiva | fondo claro, columnas densas, líneas de dependencias |
| /mi-pensum | Pensum personalizado | sistema de datos claro con selección y progreso |
| /recursos | Recursos académicos | tarjetas blancas redondeadas, gradientes y acciones |
| /hall-of-systems | Proyectos y portafolio | catálogo de producto, media, badges y filtros |
| /perfil | Perfil del usuario | producto autenticado y estados |
| /badges | Insignias | tarjetas de logro y estados semánticos |
| /admin/* | Administración | layout claro, tabs, controles y tablas de producto |

La identidad que debe inspirar el repositorio de juegos es principalmente la de /. Los patrones de producto de recursos, proyectos y administración son útiles para un dashboard interactivo, pero no deben confundirse con la composición editorial de la landing.

---

## 3. Inventario de assets

### 3.1 Assets representativos

| Asset | Uso observado | Lectura visual |
|---|---|---|
| public/logo_sistemas.png | marca principal de Ingeniería de Sistemas | logotipo azul/índigo/cyan sobre transparencia |
| public/node-logo.svg | marca del Centro de Estudiantes Node | volumen rojo facetado con geometría tipo nodo/hexágono |
| public/campus.webp y fallback JPG | campus en Director y Contacto | fotografía institucional, usada como anclaje humano |
| public/laboratories/* | tarjetas de espacios/laboratorios | fotografía real, no fondo decorativo global |
| public/people/* | retratos del director y equipo | humaniza la identidad sin romper el lenguaje técnico |
| public/alliances/* | alianzas del micrositio Node | logotipos en tarjetas de partners |
| public/qr/* | QR y recursos | acción utilitaria dentro de paneles |
| public/stamps/responsibility_seal.png | sello de responsabilidad en Spaces | elemento editorial localizado, no token global |
| public/pensum/assets/* | iconos y QR del Pensum | sistema visual propio del producto de malla |

El logo principal es un asset raster transparente. No debe recolorearse automáticamente ni reconstruirse como un gradiente genérico. El logo Node tiene una paleta roja propia y pertenece a la subidentidad del centro de estudiantes.

### 3.2 Assets existentes que no son parte de la identidad actual

src/assets/background.svg y el componente Welcome.astro corresponden al starter inicial de Astro y contienen una estética de gradientes azul/morado/rosa que no representa la landing terminada. sistemas-ucb.svg existe, pero no se utiliza como marca dominante en las rutas principales auditadas. No deben convertirse en base del rediseño de juegos sin una razón específica.

### 3.3 Principio fotográfico

Las fotografías aparecen en bloques contenidos: director, laboratorios, campus, personas y alianzas. No se usa una foto a pantalla completa como textura permanente. Cuando una imagen aparece:

- vive dentro de un contenedor con radius y borde;
- se acompaña de texto estructurado;
- tiene tratamiento de superficie o overlay si necesita legibilidad;
- sirve para demostrar espacios y comunidad, no para convertir la página en un sitio fotográfico.

---

## 4. Sistema de color real

### 4.1 Sistema base declarado en global.css

Los siguientes valores están declarados explícitamente en el tema CSS. La existencia de un token no significa que todos estén presentes en cada ruta.

#### Marca principal cyan/azul

| Token | Valor |
|---|---|
| primary | #009FE3 |
| primary-light | #38B9ED |
| primary-dark | #0077B8 |
| primary-muted | rgb(0 159 227 / 0.16) |
| primary-border | rgb(0 159 227 / 0.30) |
| primary-soft | rgb(0 159 227 / 0.10) |
| primary-strong | rgb(0 159 227 / 0.22) |
| on-primary | #FFFFFF |

#### Marca roja del Centro de Estudiantes

| Token | Valor |
|---|---|
| brand-red | #8B0000 |
| brand-red-light | #C0392B |
| brand-red-dark | #5C0000 |
| brand-red-muted | rgb(180 20 20 / 0.25) |
| brand-red-border | rgb(139 0 0 / 0.35) |

#### Acento índigo

| Token | Valor |
|---|---|
| accent-indigo | #2C2E83 |
| accent-indigo-light | #5B5EAC |
| accent-indigo-dark | #1D1F61 |
| accent-indigo-muted | rgb(44 46 131 / 0.16) |
| accent-indigo-border | rgb(44 46 131 / 0.20) |
| accent-indigo-soft | rgb(44 46 131 / 0.07) |

#### Fondos y superficies claras

| Token | Valor |
|---|---|
| bg | #F3FBFF |
| bg-white | #FFFFFF |
| bg-deep | #071B32 |
| surface | #FFFFFF |
| surface-elevated | #FFFFFF |
| surface-hover | #F3FBFF |
| surface-subtle | #E4F6FE |
| surface-accent | #F0F0FC |
| border-subtle | #BDE8F9 |

#### Texto claro

| Token | Valor |
|---|---|
| text-primary | #1D1F61 |
| text-secondary | #3A3C7B |
| text-muted | #62649A |

#### Estados declarados en el sistema claro

| Estado | Color principal | Superficie | Borde cuando existe |
|---|---|---|---|
| success | #009FE3 | #E4F6FE | — |
| warning | #2C2E83 | #F0F0FC | #A8AADE |
| critical | #1D1F61 | #F0F0FC | #A8AADE |

Estos estados son deliberadamente sobrios. El código no utiliza una semántica de verde/amarillo/rojo saturados como lenguaje dominante en la landing.

### 4.2 Valores efectivos de la landing principal en modo oscuro

La ruta principal usa Layout con theme="dark". En consecuencia, estos son los valores que normalmente se perciben en /:

| Token efectivo | Valor |
|---|---|
| primary | #11B8EE |
| primary-light | #76E1FF |
| primary-dark | #0789BE |
| primary-muted | rgb(118 225 255 / 0.20) |
| primary-border | rgb(118 225 255 / 0.28) |
| primary-soft | rgb(118 225 255 / 0.12) |
| primary-strong | rgb(118 225 255 / 0.26) |
| on-primary | #03131D |
| accent-indigo | #96A4FF |
| accent-indigo-light | #BEC6FF |
| accent-indigo-dark | #6F7DE0 |
| accent-indigo-muted | rgb(150 164 255 / 0.20) |
| accent-indigo-border | rgb(150 164 255 / 0.34) |
| accent-indigo-soft | rgb(150 164 255 / 0.10) |
| bg | #050B12 |
| bg-white | #07121E |
| bg-deep | #030810 |
| surface | #0B1624 |
| surface-elevated | #102238 |
| surface-hover | #132D43 |
| surface-subtle | #0D1E2F |
| surface-accent | #151A43 |
| border-subtle | rgb(118 225 255 / 0.22) |
| text-primary | #F4FAFF |
| text-secondary | #C2D3E0 |
| text-muted | #8AA3B5 |

Estados efectivos en oscuro:

| Estado | Color principal | Superficie | Borde |
|---|---|---|---|
| success | #5DE2A1 | #0C3024 | — |
| warning | #F0C65B | #302718 | #B99640 |
| critical | #FF7B8A | #351720 | #A94758 |

La combinación dominante de la home, por tanto, es:

- base: #030810 y #050B12;
- superficies: #0B1624, #0D1E2F y #102238;
- acción y señal: #11B8EE y #76E1FF;
- segundo nivel conceptual: #96A4FF;
- texto: #F4FAFF, #C2D3E0 y #8AA3B5.

### 4.3 Colores literales que aparecen como atmósfera

Algunos componentes usan transparencias literales además de los tokens:

- blueprint grid: rgb(0 159 227 / 0.08);
- auroras: radial-gradients con primary-muted y accent-indigo-muted;
- paneles de red: rgb(10 36 64 / 0.82);
- líneas blancas en hero y red: transparencias entre .10 y .25;
- terminal: superficies azul oscuro al 70–95% de opacidad;
- brillo de botón: blanco al 20%;
- luces del terminal: rojo, amarillo y verde como decoración local;
- nodos de red: cyan, blanco/cyan tenue e índigo según estado.

Estas transparencias son parte de la atmósfera, no nuevos colores de marca. En un proyecto de juegos deben parametrizarse con opacidad y no multiplicarse en decenas de tonos.

### 4.4 Centro de Estudiantes: subidentidad roja

La página /centro-estudiantes envuelve el contenido en .center-page y reemplaza las variables primarias:

- primary: #8B0000;
- primary-light: #C0392B;
- primary-dark: #5C0000;
- primary-muted: rgb(180 20 20 / 0.25);
- primary-border: rgb(139 0 0 / 0.35);
- primary-soft: rgb(180 20 20 / 0.10);
- primary-strong: rgb(180 20 20 / 0.25);
- bg-deep: negro;
- text-primary: #000000;
- text-secondary: #242424;
- text-muted: #5C5C5C.

El logo Node contiene los siguientes colores SVG observados:

- #D01118;
- #8D060D;
- #BA0C12;
- #6C0309;
- #B60A11;
- #6B0309;
- #670308;
- #440004;
- #610207;
- #75060B;
- #B40A10.

Esto debe tratarse como una submarca. No conviene mezclar rojo Node y cyan Sistemas en el mismo componente salvo que se esté comunicando explícitamente la relación entre ambos.

### 4.5 Pensum: sistema independiente claro

El archivo pensum.css declara otra familia visual:

- primary: #29386F;
- accent: #5C9DDE;
- ink: #000000;
- muted: #6F758B;
- line: #D5D9E7;
- paper/card: #FFFFFF.

Colores por área:

- básicas: #7FA8FF;
- software: #8BC34A;
- IA: #B07AE6;
- sistemas de información: #50C5C7;
- hardware/redes: #4B66CC;
- electivas: #F4A340;
- genérico: #B8B8B8.

Es una codificación funcional para una malla curricular densa. No se debe trasladar completa al dashboard de juegos, donde sería demasiado multicolor.

---

## 5. Tipografía

### 5.1 Familias reales

| Familia | Uso |
|---|---|
| Bebas Neue | titulares display, nombres de sección, palabras de impacto, navegación móvil |
| Montserrat | cuerpo, labels, navegación, botones, subtítulos, formularios |
| Geist Variable | telemetría, código, números de sistema, metadatos monoespaciados |
| ui-monospace / monospace | fallback para datos técnicos |
| Segoe UI/Inter/Arial | subsistema Pensum, no la landing principal |

### 5.2 Pesos cargados

Montserrat se carga en 400, 500, 700, 800 y 900. Bebas Neue se carga en 400. Geist se carga como variable.

No se observa una dependencia de múltiples pesos de Bebas. Su personalidad proviene de la condensación, el tamaño, el uppercase y el tracking, no de mezclar muchos pesos.

### 5.3 Jerarquía de la landing principal

#### Titulares

- font-family: Bebas Neue, Montserrat, sans-serif;
- weight: 400;
- text-transform: uppercase;
- letter-spacing base: .02em;
- line-height generalmente entre .86 y .98;
- hero: aproximadamente 4.3rem en móvil, 8rem desde sm y 8.8rem en desktop;
- títulos de sección: 3rem en móvil y 3.75rem desde md;
- títulos de componentes: normalmente 1.5–2.5rem según el contexto.

El hero usa una escala muy grande y condensada para crear presencia editorial. La palabra clave suele ir en primary-light, mientras el resto queda en blanco.

#### Cuerpo

- Montserrat;
- base alrededor de 1rem;
- hero desktop alrededor de 1.125rem;
- line-height cómodo, aproximadamente 1.4–1.65;
- texto secundario en text-secondary o text-muted;
- ancho restringido para evitar párrafos largos sin lectura.

#### Labels técnicos

- Montserrat 500 o 700;
- uppercase;
- letter-spacing entre .08em y .20em;
- tamaños frecuentes de .62rem, .72rem y .75rem;
- índices de sección y navegación en escala pequeña;
- color cyan, texto blanco tenue o muted según contraste.

#### Datos

- Geist Variable o ui-monospace;
- font-variant-numeric: tabular-nums;
- usado para 09 / 51, códigos, build/2026, estados, etiquetas de sistema y contadores.

### 5.4 Cómo se construye la jerarquía

La jerarquía no depende solo del tamaño. Combina:

1. contraste de color: blanco/cyan/índigo sobre navy;
2. cambio de familia: display para títulos, sans para explicación, mono para datos;
3. uppercase y tracking para labels;
4. índices numéricos;
5. líneas, puntos y pequeñas etiquetas técnicas;
6. alternancia entre superficies oscuras;
7. ancho de columna y espacio negativo.

Evitar agregar muchas familias o fuentes futuristas. La identidad se mantiene precisamente porque solo existen tres voces tipográficas claras.

---

## 6. Espaciado, layout y geometría

### 6.1 Contenedores

Los anchos observados son deliberadamente amplios pero no infinitos:

- secciones principales: max-width aproximado de 78rem;
- hero: max-width 7xl;
- ventajas/network: hasta 96rem;
- alianzas y red de partnerships: hasta 82rem;
- director y footer: normalmente max-width 6xl;
- navbar: hasta 90rem.

Los contenedores suelen usar:

- padding horizontal: 1.5rem en móvil;
- 2rem desde sm;
- 2.5rem en desktop;
- padding vertical de 4rem, 5rem o 6rem según la importancia de la sección;
- hero con padding vertical de 6rem a 7rem y compensación del navbar.

La página se siente espaciosa por el conjunto de max-width, padding y line-height, no porque cada bloque esté separado con márgenes enormes.

### 6.2 Grids y columnas

Patrones reales:

- hero: dos columnas aproximadamente 1.05fr / .95fr desde desktop;
- profile: aproximadamente .9fr / 1.1fr;
- director: retrato y texto en dos columnas;
- stats: una columna en móvil, dos en sm, cuatro en lg;
- áreas: una columna en móvil, dos en md;
- ecosystem: una columna en móvil, grid 2x2 desde md;
- career: una columna, dos en sm, cuatro en lg;
- contact: aproximadamente .85fr / 1.15fr;
- resources dentro de Contact: tres columnas, dos en tamaños intermedios, una en móvil;
- partnerships: grilla principal con panel lateral, que se vuelve una columna en <=899;
- formularios y productos: tarjetas de una a tres columnas.

### 6.3 Ritmo vertical

Los bloques importantes suelen seguir este ritmo:

- índice de sección;
- separación corta;
- título display;
- divider o descripción;
- contenido con gap 1rem–2rem;
- CTA o footer de bloque.

El componente SectionHeader centraliza parte de este ritmo. Las secciones alternan superficie y borde para marcar cambios sin usar separadores pesados.

### 6.4 Radios observados

No existe un único radius universal en todos los subsistemas. La landing combina geometría cuadrada con paneles suaves:

- cards base: 4px;
- card featured: 4px;
- botones principales definidos en CSS base: sin radius destacado; su silueta es rectangular;
- pill/index: 999px;
- icon containers: aproximadamente .5rem–.75rem;
- paneles y formularios: 1rem–1.5rem;
- terminal y tarjetas hero: 1.25rem–2rem;
- tarjetas de producto autenticado: 1.5rem–2rem;
- hexágonos: clip-path, sin radius.

Esto es importante: la landing no convierte todo en tarjetas redondeadas. La geometría cuadrada de las cards base produce una sensación más editorial y técnica; las esquinas amplias se reservan para paneles destacados, formularios, terminales y superficies de producto.

### 6.5 Geometría hexagonal

La utilidad .hexagon usa un clip-path de seis puntos:

- 50% 0%;
- 100% 25%;
- 100% 75%;
- 50% 100%;
- 0% 75%;
- 0% 25%.

Se usa en retratos, contenedores decorativos, números y el fondo global. Es un motivo estructural, no un adorno para cada elemento. Si todos los controles fueran hexagonales, perdería fuerza.

---

## 7. Superficies y componentes base

### 7.1 Card base

La clase .card es uno de los patrones más representativos:

- borde de 1.5px en primary-border;
- fondo según la superficie de la sección;
- radius de 4px;
- transición;
- hover con translateY(-4px);
- shadow: 0 8px 30px var(--color-primary-soft).

Comunica “módulo de sistema” más que “tarjeta de marketing”. Debe utilizarse en contenido informativo, propuestas, stats y bloques de espacios.

### 7.2 Card featured

.card-featured mantiene el radius pequeño, pero aumenta la prioridad:

- borde de 2px en primary;
- hover translateY(-6px);
- shadow: 0 12px 40px var(--color-primary-strong).

En el equipo Node, el miembro central además se escala alrededor de 1.04. Esa escala es específica de la jerarquía del equipo, no un comportamiento general para cualquier tarjeta.

### 7.3 Paneles oscuros

Los paneles de Hero, Advantages y Partnerships son más redondeados:

- superficie elevada o azul profundo semitransparente;
- borde cyan o blanco entre .12 y .30;
- radius normalmente xl o 2xl;
- shadow amplia, oscura y de baja opacidad;
- contenido interno con jerarquía fuerte;
- highlight de borde al estar activo.

El panel no depende de blur extremo. El fondo suele ser opaco o casi opaco; el blur se utiliza principalmente en navbar, badges flotantes, menú móvil y algunos controles.

### 7.4 Botón primario

.btn-primary:

- padding horizontal aproximado de 2.5rem;
- padding vertical aproximado de 1rem;
- background primary;
- texto on-primary;
- Montserrat bold;
- uppercase;
- tamaño pequeño;
- tracking amplio;
- overflow hidden;
- transición de .3s;
- pseudo-elemento de brillo blanco al 20% que cruza el botón;
- hover: primary-dark, translateY(-2px), shadow 0 4px 15px primary-strong.

La forma es rectangular y firme. No se observa un botón de “glow” permanente. El brillo ocurre como una microinteracción.

### 7.5 Botón outline

.btn-outline:

- background transparente;
- texto primary;
- borde de 2px primary;
- misma lógica tipográfica uppercase;
- hover: relleno primary y texto on-primary;
- translateY(-2px);
- shadow de acción.

En Hero existe además un CTA secundario local con borde blanco de 1px, no necesariamente el mismo botón outline azul. Los juegos pueden usar esa diferencia para separar acción principal de navegación secundaria.

### 7.6 Índices y badges

.section-index es una cápsula pequeña:

- borde primary-border;
- radius 999px;
- texto primary;
- Montserrat;
- aproximadamente .62rem;
- weight 800;
- tracking .16em;
- padding cercano a .35rem .6rem;
- punto previo de aproximadamente .35rem.

El patrón textual incluye índices como 01 / CARRERA, 02 / DATOS, 06 / NETWORK y estados como SYSTEM ACTIVE. Es una de las señales más reconocibles del sistema.

Los badges de estado del producto autenticado utilizan pills completas, pero son una extensión de producto. Para juegos conviene diferenciar:

- labels técnicos: section-index;
- estados de partida: pills semánticas;
- tags de categorías: pills de baja prominencia.

### 7.7 Inputs y formularios

En Contacto:

- formulario en panel radius 2xl;
- borde de 2px primary con baja opacidad;
- inputs en surface-elevated;
- borde primary;
- radius alrededor de .4rem;
- labels uppercase, pequeñas y con tracking;
- focus ring de 3px en primary-soft;
- submit full width con btn-primary.

En Node:

- panel blanco;
- borde rojo de 2px con opacidad;
- inputs transparentes/blancos;
- focus ring rojo;
- botón rojo.

La regla común es que el foco sea visible y cromáticamente consistente con la ruta.

### 7.8 Navegación

Navbar es sticky, z-index alto, con dos estados:

1. sobre el hero: transparente, texto claro y señales de marca;
2. después de aproximadamente 20px de scroll: fondo semitransparente, backdrop blur de 20px, saturate 180% y sombra discreta.

En desktop se muestra desde xl, es decir, desde aproximadamente 1280px. En tamaños menores se usa menú móvil de pantalla completa.

La navegación combina:

- logo;
- eyebrow pequeño;
- nombre en Bebas;
- enlaces uppercase;
- punto de estado;
- elemento activo rellenado con primary;
- accesos al Centro y a la plataforma;
- autenticación como control separado.

El menú móvil conserva la identidad, pero cambia a:

- panel fixed de 100dvh;
- fondo menu semitransparente;
- blur;
- links grandes en Bebas;
- cierre circular;
- Escape y bloqueo de scroll.

### 7.9 Overlays y modal

El QR modal de CommunityQrCard utiliza:

- backdrop oscuro;
- entrada con fade;
- panel con scale desde aproximadamente .94 hasta 1;
- cierre por botón y Escape;
- restauración de foco;
- focus trap;
- bloqueo de overflow del body.

Esto es un patrón accesible y relevante para un juego: la pantalla completa, instrucciones y confirmaciones deben conservar el foco y el cierre por teclado.

---

## 8. Gramática visual e identidad

### 8.1 Qué hace reconocible a la landing

La identidad se construye por la suma de seis capas:

1. base oscura institucional;
2. tipografía de impacto condensada;
3. cyan como señal de actividad;
4. anotaciones de sistema y telemetría;
5. red geométrica de líneas, puntos y hexágonos;
6. contenido real de carrera, campus, laboratorios, equipo y alianzas.

Si se elimina el contenido institucional, puede parecer una interfaz tecnológica genérica. Si se elimina la geometría, parece una web institucional convencional. Si se elimina la sobriedad, se convierte en una plantilla cyberpunk. La identidad depende del equilibrio.

### 8.2 Blueprint grid

.blueprint-grid usa dos linear-gradients:

- líneas horizontales y verticales;
- separación de 2rem;
- color cyan base con opacidad aproximada .08.

Se utiliza como textura muy sutil en Hero, Director, Advantages y Partnerships. El grid nunca compite con el copy. Su función es sugerir plano técnico y ordenar el vacío.

### 8.3 Nodos y conexiones

Los nodos se presentan de varias maneras:

- puntos individuales con pulso;
- columnas de puntos llenos y outline;
- nodos conectados por SVG;
- terminales de una red;
- hexágonos distribuidos en el background;
- ramas que progresan según scroll.

La red de Advantages es la expresión más completa: un SVG con rutas base, rutas dashed secundarias, nodos circulares, ramas y segmentos activos. La posición de las cards y el progreso del scroll se sincronizan con la red.

La red comunica recorrido, no decoración. Cada nodo corresponde a una oportunidad o etapa de la propuesta. En un juego, una red similar debe representar estados, niveles o flujo de partida; no debe estar presente detrás de todo por defecto.

### 8.4 Código y terminal

El Hero contiene un terminal visual:

- borde cyan tenue;
- panel dark/elevated;
- dots de ventana;
- label monoespaciado;
- código coloreado por acentos;
- blueprint interno;
- logo y build/2026;
- badge de campus.

Es un objeto narrativo: presenta la carrera como entorno de creación. No es un editor funcional. En juegos puede traducirse a un HUD o panel de estado, pero no conviene colocar una “ventana de código” como decoración en cada pantalla.

### 8.5 Brackets, dividers y líneas

Los corner brackets SVG aparecen en Hero, Director y Team. Los dividers punteados y líneas dashed aparecen como separación editorial y lenguaje de conexión.

Características:

- trazos finos;
- cyan, rojo Node o blanco tenue según ruta;
- poca opacidad;
- repetición controlada;
- nunca grandes marcos gruesos alrededor de toda la página.

### 8.6 Espacio negativo y composición

La home alterna:

- bloques oscuros profundos;
- bloques de superficie elevada;
- secciones con borde horizontal;
- contenido centrado dentro de max-width;
- un único protagonista visual por sección.

El espacio negativo permite que los titulares Bebas, las fotos y las redes respiren. No se intenta llenar cada hueco con partículas, líneas o tarjetas.

### 8.7 Tecnología sin cyberpunk

La página evita el cyberpunk saturado por estas decisiones concretas:

- cyan usado como acento y no como fondo completo;
- brillos bajos y localizados;
- texto blanco/off-white, no colores fluorescentes múltiples;
- superficies navy sólidas;
- ausencia de scanlines permanentes en toda la página;
- ausencia de glitch, ruido, distorsión y chromatic aberration;
- imágenes reales de campus y personas;
- jerarquía editorial clara;
- animaciones breves y con propósito.

---

## 9. Componentes y secciones representativos

### 9.1 Hero

**Aspecto**

Hero ocupa casi toda la primera pantalla. El copy está a la izquierda en desktop y centrado en móvil. A la derecha hay un terminal flotante. El fondo combina navy profundo, grid técnico, aurora radial y scan line ocasional.

**Construcción**

- min-height cercana a viewport menos navbar;
- background bg-deep;
- blueprint con opacidad baja;
- auroras radiales cyan e índigo;
- brackets SVG y columna de puntos;
- grid 1.05fr / .95fr;
- H1 Bebas de escala muy grande;
- system index y status mono;
- dos CTAs;
- stats compactas;
- terminal con código.

**Interacción**

- scan line de 8s;
- terminal con node-drift de 7s;
- CTAs con hover de elevación;
- scroll arrow con bounce;
- reduced motion desactiva o reduce estos efectos.

**Por qué es representativo**

Resume el sistema completo: tipografía, datos, red, código, cyan, espacio negativo y narrativa de carrera.

**Para un agente sin repositorio**

Recrear la composición, no copiar el copy exacto. La proporción importante es: 60% mensaje institucional y acción, 40% objeto técnico visual. El terminal no debe ocupar más atención que el titular.

### 9.2 Navbar

**Aspecto**

Navegación flotante sobre el hero y convertida en barra translúcida al hacer scroll. El activo usa relleno cyan. Los enlaces del Centro usan la variante roja cuando corresponde. La plataforma tiene controles propios.

**Construcción**

- sticky;
- max-width amplio;
- logo y nombre en bloque;
- links técnicos en escala pequeña;
- dot de estado;
- auth separado;
- menú mobile fixed.

**Interacción**

- cambio al superar 20px de scroll;
- active section calculado por posición;
- abrir/cerrar, Escape, click fuera y resize;
- bloqueo de scroll en mobile.

**Por qué es representativo**

Conecta las subáreas del ecosistema sin perder el lenguaje de sistema.

### 9.3 StatsBanner

**Aspecto**

Franja más clara, con cuatro datos: 09 / semestres, 51 / asignaturas, y acreditaciones/organismos. Cada dato vive en una card de alto mínimo aproximado de 9rem.

**Construcción**

- sección con borde superior e inferior;
- grid 1/2/4;
- .card;
- icon container cyan;
- número Bebas 2.25–3rem;
- label pequeña uppercase.

**Interacción**

- reveal stagger;
- icon hover;
- contadores en otras secciones mediante IntersectionObserver.

**Por qué es representativo**

Convierte datos institucionales en módulos visuales compactos sin dashboardizar toda la landing.

### 9.4 AreasSection con flip cards

**Aspecto**

Cuatro áreas aparecen como tarjetas con una cara frontal y una cara posterior. El frente contiene icono y título; el reverso contiene descripción y chips.

**Construcción**

- dos columnas en md;
- .area-card basado en .card;
- min-height aproximada de 18rem;
- front/back absolute;
- icon square de 3.5rem;
- back en bg-deep con texto blanco;
- chips redondeados.

**Interacción**

- hover y tap;
- Enter activa el flip;
- focus outline de 3px;
- transiciones de opacidad, translateY y pequeña rotación.

**Por qué es representativo**

Usa interacción para revelar profundidad sin añadir un modal. Es un buen patrón para categorías de juegos o modos de juego, siempre que el estado sea entendible en teclado y touch.

### 9.5 CurriculumSection

**Aspecto**

Timeline vertical de cinco etapas con una línea lateral, nodos circulares y cards de temas.

**Construcción**

- track vertical de 1px;
- nodes de 3rem;
- card con topics pills;
- estado activo con fill cyan y ring;
- progress bar de altura variable;
- tres acciones finales.

**Interacción**

- IntersectionObserver activa etapas;
- progreso se actualiza;
- cards entran con reveal;
- focus y lectura mantienen orden lineal.

**Por qué es representativo**

Demuestra cómo la identidad convierte una estructura académica compleja en un recorrido visual. Para juegos, este patrón puede representar onboarding, fases o progreso de torneo.

### 9.6 AdvantagesSection y partnership network

**Aspecto**

Advantages es una sección oscura de pantalla completa extendida, con red SVG sticky y cards horizontales. Partnerships es una red más editorial con paneles de empresas, directorio, internacionalización e impacto.

**Construcción**

- fondo bg-deep;
- blueprint;
- aurora;
- SVG de red;
- nodos, ramas y conexiones;
- cards de ancho aproximado 18–22rem;
- posiciones high/mid/low;
- paneles oscuros con bordes tenues.

**Interacción**

- scroll desktop controla desplazamiento horizontal;
- node y branch activos siguen la card;
- scroll-snap horizontal en móvil;
- red se oculta en móvil;
- prefers-reduced-motion deshabilita la coreografía.

**Por qué es representativo**

Es la máxima expresión del concepto de ecosistema conectado. También es el patrón que más fácilmente puede convertirse en exceso. Debe reservarse para mapas, fases, relaciones o progreso, no para un simple listado.

### 9.7 SpacesSection

**Aspecto**

Tres tarjetas fotográficas para laboratorios/espacios, con imagen contenida, título, texto y metadata. Una lleva el sello de responsabilidad.

**Construcción**

- grid de tres en lg;
- .card;
- imagen aproximadamente 12rem de alto;
- object-fit cover;
- contenido con padding;
- sello raster posicionado localmente.

**Interacción**

- hover normal de card;
- sello tiene una animación de impresión cercana a .98s;
- reduced motion deshabilita la animación.

**Por qué es representativo**

Equilibra tecnología con campus real. Es una defensa contra una estética puramente abstracta.

### 9.8 ContactSection

**Aspecto**

Dos columnas: campus/mapa y formulario. Debajo, recursos QR, salud psicológica y admisiones.

**Construcción**

- fondo surface-subtle;
- formulario radius 2xl;
- inputs elevados;
- focus ring cyan;
- recursos en cards horizontales/verticales responsive.

**Interacción**

- submit a API;
- estado de envío/respuesta;
- QR modal;
- hover en recursos.

**Por qué es representativo**

Demuestra la conexión entre marca, información práctica y accesibilidad. No es solo un cierre visual.

### 9.9 Centro de Estudiantes Node

**Aspecto**

Hero blanco con logo Node rojo, nombre gigante, brackets y puntos rojos. Luego perfil, contadores, equipo, propuestas, alianzas y sugerencias.

**Construcción**

- .center-page cambia primary a rojo;
- background claro;
- headings Bebas;
- cards blancas con borde rojo;
- hexágonos para retratos y numeración;
- team grid con featured member;
- propuestas en cuatro pilares;
- placeholders dashed para partners futuros.

**Interacción**

- hero reveal;
- counters;
- hover de cards;
- formulario;
- fallback de iniciales en retratos.

**Por qué importa para el handoff**

Demuestra que el ecosistema admite una subidentidad. Si los juegos pertenecen específicamente a Node, el rojo puede ser una capa de contexto. Si pertenecen a Ingeniería de Sistemas, el azul/cyan debe seguir siendo la base.

### 9.10 Pensum

**Aspecto**

Interfaz clara, densa y casi editorial técnica: nueve columnas de semestres, cards pequeñas de materias, colores por área y conexiones SVG.

**Construcción**

- min-width amplio;
- overflow horizontal;
- cards de 64px mínimos;
- líneas de prerequisitos;
- leyenda;
- estados selected/unlocked/prereq;
- print layout landscape.

**Por qué importa**

Es un ejemplo real de cómo la identidad de Sistemas funciona también en visualización de datos. Pero sus colores por área, tipografía Segoe/Inter y densidad no deben trasladarse literalmente al juego.

---

## 10. Motion design completo

### 10.1 Tokens y keyframes globales

El tema declara:

- fade-in-up: .5s ease-out;
- fade-in: .4s;
- scale-in: .3s;
- hex-float: 20s;
- slide-in-left/right: .4s;
- count-up: 2s como token declarado;
- pulse-glow: 2s;
- hamburger-open: .3s como token declarado.

También existen keyframes para:

- hero-text-reveal;
- stagger-in;
- signal-pulse;
- scan-line;
- node-drift.

No todos los nombres de animación declarados se usan directamente en todos los componentes. Hay que distinguir tokens de intención y efectos realmente visibles.

### 10.2 Aparición al entrar al viewport

Layout.astro instala un IntersectionObserver:

- rootMargin 0;
- threshold .1;
- detecta .reveal y variantes;
- agrega .visible;
- deja de observar el elemento después de activarlo.

Variantes observadas:

- reveal: opacity 0 + translateY(30px);
- reveal-wipe: clip-path;
- reveal-tilt-left/right: desplazamiento, rotación aproximada de 4deg y scale .96;
- reveal-pop: opacity, scale .82, y 18px, blur 6px;
- reveal-rise-soft: opacity, y 42px, scale .98.

Hay delays aproximados de .1s a .5s para stagger.

La aparición es parte de la identidad, porque da sensación de sistema que se activa al recorrerlo. No debe convertirse en una animación de entrada obligatoria para cada párrafo.

### 10.3 Hero motion

- scan line: 8 segundos;
- terminal node drift: 7 segundos;
- auroras estáticas o movimiento muy lento según sección;
- scroll arrow: bounce;
- hero text: reveal inicial de aproximadamente .6s;
- logo/terminal: scale y fade cortos.

Estas animaciones son ambientales. No deben bloquear la lectura.

### 10.4 Navbar y controles

- navbar: transición alrededor de .3s;
- menú móvil: fade/visibility y transición alrededor de .25–.3s;
- hamburger: transformación de líneas;
- links: hover con .2–.3s;
- botones: brillo, color, translateY y shadow en .3s.

### 10.5 Network y scroll

Advantages:

- usa scroll para traducir cards horizontalmente;
- calcula progreso;
- activa card y nodos;
- actualiza ramas y barra de progreso;
- desktop desde aproximadamente 900px;
- mobile se transforma en scroller horizontal con scroll-snap;
- la red SVG se oculta en mobile.

Es una interacción de contenido, no una simple animación decorativa.

### 10.6 Interacciones de contenido

- Areas: flip por hover, tap y Enter;
- Curriculum: estados por IntersectionObserver;
- Counters: incrementos cada 40ms hasta el valor;
- QR: fade .25s y scale .94→1;
- role tooltips: hover/focus;
- CareStamp: print effect cercano a .98s;
- Partnerships: rise-in, entradas secuenciales y aurora lenta de 18s;
- signal dots: pulse aproximado de 1.8–2.2s.

### 10.7 Reduced motion

global.css incluye prefers-reduced-motion:

- anima/transiciona a aproximadamente .01ms;
- elimina smooth scroll;
- hace visibles las variantes reveal;
- elimina transform y filtros de entrada.

Advantages, Partnerships, CareStamp y algunas interacciones agregan reglas locales. Un proyecto de juegos debe conservar esta política desde el inicio.

### 10.8 Qué motion sí trasladar a juegos

Sí trasladar:

- aparición corta de paneles;
- feedback de botón;
- pulso de estado activo;
- progreso;
- entrada escalonada de opciones;
- cambio claro entre lobby, partida y resultado;
- una red o línea que muestre progreso real.

No copiar indiscriminadamente:

- la sección sticky de una pantalla completa;
- scanline permanente;
- node-drift en todo;
- counters animados para información estática;
- flip cards para controles críticos;
- parallax y aurora en cada vista;
- la animación del sello, que es editorial y local.

---

## 11. Responsive y UX

### 11.1 Breakpoints observados

Se usan breakpoints Tailwind convencionales y media queries locales:

- 480px;
- 640px / sm;
- 700px;
- 768px / md;
- 899px;
- 900px;
- 1023px;
- 1024px / lg;
- 1279px;
- 1280px / xl;
- 1320px.

No todos son tokens globales. Son decisiones locales de cada componente.

### 11.2 Desktop

En desktop la landing aprovecha:

- dos columnas;
- hero terminal;
- grids de dos, tres o cuatro tarjetas;
- red SVG y scroll-driven storytelling;
- navbar horizontal;
- imágenes grandes;
- mayor escala tipográfica;
- max-width amplio con espacio negativo.

La densidad aumenta sin apilar elementos de forma arbitraria.

### 11.3 Laptop y tablet

Entre lg y xl:

- las grids reducen columnas;
- la Navbar todavía puede estar en modo móvil hasta 1280px;
- ventajas ya puede estar en el modo de desktop desde 900px;
- paneles mantienen su padding, pero los títulos bajan escala;
- partnerships cambia antes que la navbar;
- Contact y resources pasan a dos columnas antes de móvil.

Esto significa que “tablet” no es un único estado. La navegación y el contenido tienen umbrales distintos.

### 11.4 Móvil

En móvil:

- hero pasa a una columna y se centra;
- el terminal baja debajo del copy;
- el hero puede dejar de forzar min-height completa en <=639px;
- stats pasan a dos o una columna;
- cards se apilan;
- Advantages cambia a scroller horizontal con snap;
- la red gráfica se oculta;
- partnerships pasa a una columna y sus estadísticas se verticalizan;
- Contact pasa a una columna;
- recursos pasan a una columna;
- Navbar ocupa viewport completo;
- botones y CTAs conservan áreas tocables;
- textos reducen tamaño sin abandonar Bebas/uppercase.

### 11.5 Pensum móvil

Pensum no colapsa completamente como una app móvil. Mantiene un min-width grande y permite overflow horizontal:

- alrededor de 1180px o 1120px según bloque;
- shell con overflow-x auto;
- se conserva la lectura de nueve semestres;
- tipografía y decoraciones se reducen;
- print elimina restricciones para landscape.

Es una decisión deliberada de densidad de datos. No se debe asumir que toda la identidad responde con cards apiladas.

### 11.6 Legibilidad y accesibilidad observable

Patrones positivos observados:

- focus-visible en controles;
- outline para area cards;
- navegación por Enter en elementos interactivos;
- Escape en menú y modal;
- restauración de foco del QR;
- reduced motion;
- fallback de iniciales en imágenes de equipo;
- labels y estados textuales;
- contraste alto en la landing oscura.

Para el proyecto de juegos, estos comportamientos son tan importantes como el color. No ocultar estados críticos exclusivamente con color o animación.

---

## 12. Qué es sistema global y qué es solución local

### 12.1 Debe considerarse sistema

- paleta efectiva oscuro: #030810, #0B1624, #102238, #11B8EE, #76E1FF, #96A4FF;
- Montserrat + Bebas Neue + Geist;
- section-index;
- blueprint grid;
- geometría de nodos/hexágonos;
- bordes finos cyan;
- superficies navy;
- botones rectangulares con hover breve;
- reveal con reduced motion;
- navegación sticky que se vuelve translúcida;
- espacio negativo y max-width;
- conexión entre datos reales e interfaz técnica.

### 12.2 Es una solución local

- terminal específico del Hero;
- scan line;
- sello CareStamp;
- la red sticky de Advantages;
- flip card de Areas;
- colors por área del Pensum;
- logo Node y rojo;
- placeholders de alianzas;
- tooltip de nombre completo;
- QR modal;
- contadores 18 / 4 / 1 del micrositio;
- colores de las luces del terminal.

El agente de juegos puede reutilizar la lógica conceptual de estos patrones, pero no debe poner todos los efectos simultáneamente.

---

## 13. Antipatrones: qué NO debe hacer el proyecto de juegos

### 13.1 Color

No:

- usar negro puro con cyan al 100% en cada borde;
- sumar verde neón, magenta, naranja y violeta sin función;
- convertir el rojo Node en color de acción global;
- usar gradientes de arcoíris;
- reemplazar el blanco/off-white por texto cyan completo;
- usar la paleta multicolor del Pensum para cada categoría de juego;
- inventar un nuevo azul sin necesidad.

Sí:

- base navy profunda;
- cyan para acción, selección y conexión;
- índigo para segundo nivel;
- estados semánticos oscuros;
- rojo solo para error/alerta o submarca Node cuando corresponda.

### 13.2 Superficies

No:

- aplicar glassmorphism transparente y blur a todas las cards;
- usar sombras negras muy duras en cada elemento;
- redondear todo con radius 999px;
- hacer tarjetas enormes, flotantes y brillantes sin jerarquía;
- rodear toda la pantalla con marcos técnicos.

Sí:

- superficie opaca o casi opaca;
- bordes finos;
- radius pequeño para módulos y mayor para paneles de interacción;
- shadow amplia y sutil solo en elevación;
- un elemento destacado por vista.

### 13.3 Decoración tecnológica

No:

- llenar cada fondo con nodos, partículas y líneas;
- usar glitch, scanlines, ruido, chromatic aberration o distorsión como identidad;
- colocar un hexágono alrededor de cada icono;
- dibujar una red que no representa estado, progreso o relación;
- convertir el HUD en una terminal falsa sin información útil.

Sí:

- blueprint tenue;
- nodos escasos;
- líneas con significado;
- hexágonos reservados para marca, retratos o hitos;
- código/telemetría solo donde aporte contexto.

### 13.4 Motion

No:

- hacer que cada card rebote;
- poner hover que cambie de tamaño de forma agresiva;
- usar parallax constante en una pantalla de juego;
- animar timers o números de forma que afecte la lectura;
- esconder controles detrás de un flip;
- ignorar prefers-reduced-motion.

Sí:

- feedback breve;
- entrada escalonada;
- pulso para activo;
- transición de estado;
- progreso asociado a una acción real.

### 13.5 Composición

No:

- copiar la landing como una larga página de marketing dentro del juego;
- presentar dashboard, lobby, gameplay y resultados como secciones indistinguibles;
- usar un hero gigante antes de que el equipo pueda comenzar;
- repetir el mismo título Bebas de tamaño máximo en cada pantalla;
- llenar el espacio con tarjetas por parecer “más tecnológico”.

Sí:

- usar una shell de producto;
- jerarquizar acción primaria;
- dejar que el juego sea el protagonista;
- conservar la identidad en color, tipografía, labels, superficies y motion.

### 13.6 Dependencia de documentación antigua

No construir el sistema a partir de docs/Styling.md o de los assets starter de Astro. El azul/cyan oscuro de la landing principal y el rojo/blanco de Node son contextos distintos. Elegir conscientemente cuál aplica a la aplicación de juegos.

---

## 14. Design tokens propuestos a partir de valores reales

Esta representación compacta no inventa nuevos valores. Resume los valores encontrados y señala cuándo pertenecen a una variante.

### COLORS

~~~css
/* Landing principal: valores efectivos de theme-dark */
--color-bg: #050B12;
--color-bg-white: #07121E;
--color-bg-deep: #030810;
--color-surface: #0B1624;
--color-surface-elevated: #102238;
--color-surface-hover: #132D43;
--color-surface-subtle: #0D1E2F;
--color-surface-accent: #151A43;

--color-primary: #11B8EE;
--color-primary-light: #76E1FF;
--color-primary-dark: #0789BE;
--color-primary-muted: rgb(118 225 255 / 0.20);
--color-primary-border: rgb(118 225 255 / 0.28);
--color-primary-soft: rgb(118 225 255 / 0.12);
--color-primary-strong: rgb(118 225 255 / 0.26);
--color-on-primary: #03131D;

--color-accent-indigo: #96A4FF;
--color-accent-indigo-light: #BEC6FF;
--color-accent-indigo-dark: #6F7DE0;
--color-accent-indigo-muted: rgb(150 164 255 / 0.20);
--color-accent-indigo-border: rgb(150 164 255 / 0.34);
--color-accent-indigo-soft: rgb(150 164 255 / 0.10);

--color-text-primary: #F4FAFF;
--color-text-secondary: #C2D3E0;
--color-text-muted: #8AA3B5;
--color-border-subtle: rgb(118 225 255 / 0.22);

--color-success: #5DE2A1;
--color-success-surface: #0C3024;
--color-warning: #F0C65B;
--color-warning-surface: #302718;
--color-warning-border: #B99640;
--color-critical: #FF7B8A;
--color-critical-surface: #351720;
--color-critical-border: #A94758;
~~~

Base claro y subidentidades existentes:

- base claro: #F3FBFF, #FFFFFF, #071B32, #E4F6FE, #F0F0FC, #BDE8F9, #1D1F61, #3A3C7B, #62649A;
- Node: #8B0000, #C0392B, #5C0000, rgb(180 20 20 / .25);
- Pensum: #29386F, #5C9DDE, #D5D9E7 y colores de áreas documentados en la sección de color.

### TYPOGRAPHY

~~~css
--font-display: 'Bebas Neue', 'Montserrat', sans-serif;
--font-body: 'Montserrat', sans-serif;
--font-mono: 'Geist Variable', ui-monospace, monospace;

/* patrones observados */
--hero-title-size: 4.3rem móvil / 8rem sm / 8.8rem desktop;
--section-title-size: 3rem móvil / 3.75rem md;
--body-size: 1rem;
--hero-body-size: 1.125rem desktop;
--label-size: .62rem–.75rem;
--display-weight: 400;
--body-weights: 400, 500, 700, 800, 900;
--display-letter-spacing: .02em;
--label-letter-spacing: .08em–.20em;
--display-line-height: .86–.98;
--data-numeric: tabular-nums;
~~~

### SPACING

Valores observados con mayor frecuencia:

- 0.25rem, 0.35rem, 0.5rem, 0.6rem y 0.75rem para microespaciado;
- 1rem, 1.25rem y 1.5rem para controles y cards;
- 2rem para grids, blueprint y gaps medios;
- 3rem–5rem para separación de bloques;
- 4rem/5rem/6rem para padding vertical de secciones;
- horizontal de sección: 1.5rem móvil, 2rem sm, 2.5rem desktop;
- contenedor principal cercano a 78rem;
- navbar cercano a 90rem;
- network/Advantages hasta 96rem.

No hay una escala numérica única declarada como token. Estos valores son patrones reales de clases y CSS.

### RADIUS

- card base: 4px;
- card featured: 4px;
- icon containers: .5rem–.75rem;
- paneles: 1rem–1.5rem;
- terminal/formulario: 1.25rem–2rem;
- product cards: 1.5rem–2rem;
- pills y section-index: 999px;
- hexágonos: clip-path;
- variable shadcn global: .625rem, usada por componentes de infraestructura.

### BORDERS

- card: 1.5px primary-border;
- featured: 2px primary;
- outline button: 2px primary;
- paneles oscuros: 1px con primary/white entre .12 y .30;
- border-subtle dark: rgb(118 225 255 / .22);
- dashed line: 1px dashed primary-border;
- focus ring típico: 3px primary-soft;
- Node: bordes rojos de 2px con opacidad.

### SHADOWS

Valores observados:

- card hover: 0 8px 30px primary-soft;
- featured hover: 0 12px 40px primary-strong;
- button hover: 0 4px 15px primary-strong;
- terminal: 0 30px 100px rgba(0, 0, 0, .4);
- network cards: alrededor de 0 20px 70px rgba(0, 0, 0, .25);
- partnership panel: alrededor de 0 20px 48px primary con opacidad .12;
- modal/product surfaces: sombras amplias de 20–30px y opacidades bajas.

La sombra es contextual; no existe una sombra global obligatoria.

### MOTION

- reveal: .5s ease-out;
- fade: .4s;
- scale-in: .3s;
- card/button hover: .2–.3s;
- curriculum progress: alrededor de .65s;
- scan line: 8s;
- terminal drift: 7s;
- hex float: 20s;
- partnership aurora: 18s;
- signal pulse: 1.8–2.2s;
- CareStamp print: aproximadamente .98s;
- counter increment: cada 40ms hasta el objetivo;
- reduced motion: transiciones/animaciones aproximadamente .01ms y estados visibles.

### BREAKPOINTS

- 480px: ajustes finos;
- 640px / sm: primer cambio de grid y hero;
- 768px / md: columnas, títulos y layouts principales;
- 900px: Advantages cambia entre red sticky y modo móvil;
- 1024px / lg: grids grandes y Contact;
- 1280px / xl: navbar desktop;
- 1320px: ajustes específicos de Pensum.

Los breakpoints no son uniformes: seleccionar según la interacción, no solo según el framework.

---

## 15. INSTRUCCIONES DE IMPLEMENTACIÓN PARA EL REPOSITORIO DE JUEGOS

### 15.1 Objetivo de la traducción

La aplicación de juegos debe sentirse como un producto interactivo perteneciente al ecosistema de Ingeniería de Sistemas UCB. No debe ser una landing larga con un juego incrustado.

La identidad debe trasladarse mediante:

- color;
- tipografía;
- índices y labels técnicos;
- superficies;
- geometría;
- nodos y progreso;
- microinteracciones;
- tratamiento de estados;
- calidad del espaciado.

La estructura debe ser la propia de un producto de juegos:

1. dashboard o selección;
2. lobby/equipos;
3. instrucciones;
4. pantalla de juego;
5. pausa o ayuda;
6. resultado;
7. historial o volver al dashboard.

### 15.2 Shell del dashboard

Usar una shell oscura basada en:

- fondo #030810 o #050B12;
- superficies #0B1624 y #102238;
- texto #F4FAFF;
- texto secundario #C2D3E0;
- cyan #11B8EE para acción y selección;
- cyan claro #76E1FF para foco y highlights;
- índigo #96A4FF para categorías secundarias.

El dashboard puede tener:

- navbar compacta;
- marca de Sistemas;
- índice técnico como 01 / JUEGOS;
- estado de sesión o evento con punto;
- selector de equipo;
- cards de juegos;
- estadísticas mínimas;
- CTA de comenzar.

No poner un H1 de 8rem si impide llegar rápidamente al juego. En este contexto la acción es más importante que el hero.

### 15.3 Cards de juegos

Cada card debe comunicar:

- nombre del juego;
- tipo o categoría;
- cantidad de jugadores;
- duración;
- estado: disponible, en curso, bloqueado o completado;
- acción primaria.

Recomendación basada en patrones reales:

- usar base card con borde fino;
- permitir radius de 4px en tarjetas informativas;
- usar radius 1rem–1.5rem en una card interactiva grande si mejora el touch target;
- top accent line o icon square, no un gradiente de fondo completo;
- estado activo con borde cyan y shadow primary-soft;
- contenido interno claro y compacto;
- tags como pills pequeñas;
- metadata en Geist.

No usar una ilustración o glow en cada card. El juego seleccionado debe ser el único que tenga mayor contraste.

### 15.4 Botones y controles

Acción primaria:

- fondo #11B8EE;
- texto #03131D;
- uppercase Montserrat bold;
- tracking moderado;
- hover #0789BE;
- translateY(-2px) y shadow breve;
- estado disabled con contraste reducido, sin animación.

Acción secundaria:

- transparente;
- borde 2px cyan;
- texto cyan;
- hover con relleno cyan y texto oscuro.

Controles de navegación:

- pueden usar borde blanco/cyan tenue;
- no deben confundirse con el CTA principal;
- mantener área táctil clara;
- focus ring de 3px.

Si el juego pertenece al evento Node, usar rojo #8B0000 únicamente para la marca del evento o acciones de contexto, manteniendo el sistema base azul/cyan para que se reconozca como parte de Sistemas.

### 15.5 Lobby y administración sencilla de equipos

El lobby debe parecer un panel de producto, no una sección editorial:

- header compacto con nombre de evento y estado;
- lista de equipos en filas o cards;
- avatar/initials;
- nombre del equipo;
- miembros;
- estado de conexión;
- acción para editar o unir;
- botón de comenzar cuando corresponda.

Patrones visuales:

- rows con border-bottom sutil;
- panels #0B1624/#102238;
- datos en Geist;
- estado online con #5DE2A1;
- advertencia con #F0C65B;
- error con #FF7B8A;
- cyan para selección;
- índigo para equipo secundario o categoría.

La administración debe ser simple:

- agregar equipo;
- renombrar;
- asignar miembros;
- quitar equipo con confirmación;
- marcar listo;
- iniciar partida.

Las confirmaciones deben usar modal accesible con Escape, foco y backdrop, siguiendo el patrón QR.

### 15.6 Pantalla de instrucciones

Usar una pantalla breve y accionable:

- índice técnico;
- título Bebas de escala moderada;
- objetivo en una card;
- reglas en pasos numerados;
- controles;
- duración y puntuación;
- CTA Comenzar;
- enlace Volver.

Una línea de nodos puede indicar:

Preparación → Ronda → Puntuación.

La red solo debe mostrar esas etapas porque representan un flujo real.

### 15.7 HUD de juego

El HUD debe priorizar el juego y usar la identidad como marco:

- barra superior compacta;
- nombre/equipo;
- timer en Geist con tabular-nums;
- puntuación;
- indicador de ronda;
- estado con dot;
- progreso lineal cyan;
- botón de pausa/ayuda.

El fondo puede usar blueprint grid al 4–8% de opacidad. Añadir pocos nodos periféricos, no una red completa detrás de cada pregunta.

Si hay tarjetas de pregunta:

- panel principal en #102238;
- borde cyan tenue;
- prompt en Montserrat;
- opción seleccionada con primary;
- opción correcta con success;
- error con critical;
- feedback con transición .2–.3s;
- no usar solo color: incluir texto, icono o cambio de borde.

### 15.8 Temporizadores y estados

El timer debe:

- usar Geist;
- utilizar números tabulares;
- mantener ancho estable;
- cambiar de color únicamente al entrar en warning/critical;
- no pulsar continuamente;
- anunciar el cambio de estado si el juego usa accesibilidad.

Estados recomendados con valores existentes:

- normal: text-primary;
- activo: primary-light;
- éxito: #5DE2A1 sobre #0C3024;
- advertencia: #F0C65B sobre #302718;
- crítico: #FF7B8A sobre #351720;
- bloqueado: text-muted con border-subtle.

### 15.9 Pantalla completa

La pantalla de juego puede entrar en fullscreen, pero debe conservar:

- identidad de marca;
- acceso a pausa;
- indicador de equipo;
- salida clara;
- foco de teclado;
- contraste;
- reduced motion.

Al entrar en pantalla completa, reducir la navegación y el branding a un nivel discreto. El juego debe ocupar la atención. Un pequeño logo, índice y estado bastan.

### 15.10 Resultados

La pantalla de resultados puede recuperar un poco de la composición editorial:

- título Bebas;
- número o posición grande;
- panel de puntuación;
- ranking;
- datos técnicos en Geist;
- línea de conexión o nodos de progreso;
- acciones Repetir, Volver al dashboard y Ver resultados.

El ganador puede usar borde cyan más fuerte y una sombra primary-strong. No usar confetti neón, degradados arcoíris ni una explosión de partículas que contradiga la sobriedad.

### 15.11 Responsive para juegos

Desktop:

- dashboard en 2–4 columnas;
- HUD horizontal;
- panel principal con sidebar opcional;
- lobby con filas.

Tablet:

- dos columnas o una principal más panel secundario;
- navbar compacta;
- controles agrupados.

Móvil:

- una columna;
- CTA ancho;
- cards con área táctil;
- HUD dividido en dos filas si hace falta;
- timer visible;
- opciones de juego apiladas;
- red decorativa reducida u oculta;
- no depender del hover;
- no usar flip card como única forma de ver información.

### 15.12 Motion recomendado para el producto

Mantener:

- entrada de dashboard de .4–.5s;
- hover/press de .2–.3s;
- pulso de estado activo de alrededor de 2s;
- transición de progreso alrededor de .6s;
- stagger corto para lista de juegos;
- transición de resultado clara.

Evitar:

- scroll hijacking como navegación principal;
- una sección sticky de 100svh para cada juego;
- scan line de 8s en la pantalla de partida;
- movimiento de fondo que distraiga del timer;
- animar todos los nodos al mismo tiempo.

### 15.13 Checklist de coherencia final

Antes de entregar el repositorio de juegos, comprobar:

- ¿La base usa el navy/cyan/índigo real?
- ¿Montserrat, Bebas y Geist cumplen funciones distintas?
- ¿El cyan señala acción/estado y no inunda el fondo?
- ¿Las líneas y nodos representan progreso o relación?
- ¿Las cards tienen una jerarquía clara?
- ¿El juego puede iniciarse rápidamente?
- ¿El HUD sigue siendo legible en móvil?
- ¿Los estados tienen texto además de color?
- ¿Existe focus visible y soporte de teclado?
- ¿Escape cierra modal/pausa?
- ¿Reduced motion deja una experiencia completa?
- ¿El rojo se limita a Node/error/contexto?
- ¿La interfaz parece un producto de Sistemas UCB y no una plantilla cyberpunk?

---

## 16. Conclusión

El sistema visual auditado es consistente cuando se entiende como una identidad de ingeniería institucional: profunda, técnica, conectada y humana. Sus elementos esenciales no son los efectos aislados, sino la relación entre tipografía display, datos monoespaciados, navy, cyan, índigo, geometría de nodos, blueprint tenue, superficies legibles y contenido real.

Para el repositorio de juegos, la transferencia correcta es conservar esas reglas de percepción mientras se cambia la arquitectura a una aplicación interactiva. El resultado debe sentirse como otra superficie del mismo sistema, no como una copia literal de la landing.
