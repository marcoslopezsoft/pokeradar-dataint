# PokéRadar Geoespacial Interactivo 🌐⚡

> Aplicación web interactiva de visualización geoespacial desarrollada para el desafío técnico de **DataInt** (Ingeniería de Software · Visualización Geoespacial).

---

## 1. Concepto y Narrativa 🧭

### ¿Qué es PokéRadar?
PokéRadar transforma los datos de la **PokéAPI v2** en una expedición cartográfica inmersiva basada en biomas reales de Argentina. Inspirado en el concepto visual moderno de Pokédex (Behance), en lugar de colocar marcadores estáticos sobre un mapa genérico, el sistema fusiona:
- **Biomas Geográficos Auténticos**: Glaciar Perito Moreno (Hielo/Agua), Selva de Iguazú (Planta/Bicho/Agua), Quebrada de Humahuaca (Roca/Tierra/Fuego), Metrópolis de Buenos Aires (Eléctrico/Normal/Psíquico), Cumbre del Aconcagua (Volador/Dragón) y Península Valdés (Agua/Hada/Siniestro), delimitados con polígonos GeoJSON y pines interactivos al alejar el zoom.
- **Meteorología en Tiempo Real (Open-Meteo)**: Telemetría climática en vivo por bioma (temperatura, condición atmosférica y viento) que prioriza dinámicamente las especies del pool afines al clima actual (`weatherBoosted`) y muestra íconos de tipos potenciados con tooltips instantáneos.
- **Visualización Limpia sin Cajas**: Marcadores sobre el mapa representados directamente por el sprite animado del espécimen, con sombras de contacto en el terreno y microinteracciones optimizadas a 60 FPS en desktop y mobile.
- **Audio Auténtico (`cries.latest`) & SFX Web Audio**: Reproducción de alaridos sonoros oficiales en formato `.ogg`, música ambiental con controles de volumen y sintetizador Web Audio de efectos para diálogos, capturas y liberaciones.
- **Equipo de Expedición (Party Dock & Diagnóstico Táctico Pokédex)**: Dock flotante con chasis rojo clásico Pokédex (lente azul, LEDs y ranuras LCD con insignias `Nv.`) que se recentra suavemente al abrir o cerrar el panel lateral, persistiendo hasta 6 Pokémon en `localStorage`, con guía interactiva del Profesor Oak y un Diagnóstico Táctico grupal e individual con matriz de efectividad elemental (18 tipos), roles, resistencias, debilidades y tarjetas con fondo mitad-y-mitad por tipo elemental.
- **Estética Pokédex Unificada & Tipografía Poppins**: Panel lateral [`DetailDrawer`](src/components/pokemon/detail-drawer.tsx) con división diagonal escalonada en SVG para Pokémon de doble tipo, sprites normalizados en altura y tipografía Poppins (400, 500, 600) íntegramente en español.

---

## 2. Arquitectura y Stack Técnico 🛠️

### Stack Principal
- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, Turbopack, `cacheComponents`, React 19).
- **Lenguaje**: TypeScript Estricto (cero `any`).
- **Gestor de Paquetes**: **pnpm** (aislamiento eficiente de dependencias y rendimiento).
- **Motor Geoespacial**: [MapLibre GL JS](https://maplibre.org/) con estilo raster claro de OpenStreetMap a 60 FPS, sin marcas de agua ni API keys.
- **Animaciones e Interacciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones del drawer lateral, diálogos, modal táctico y barras de estadísticas, más **Lenis** para scroll suave en desktop.
- **Estilos**: Tailwind CSS v4 para diseño Pokédex responsive en mobile y desktop.
- **Tipografía**: Google Font **Poppins** (Regular, Medium y SemiBold) configurada con `next/font/google`.
- **Iconografía**: [Lucide React](https://lucide.dev/) e [Iconify (`@iconify/react`)](https://iconify.design/).

### Estructura del Código
```text
src/
├── app/
│   ├── layout.tsx              # Shell Server Component con fuente Poppins y metadata
│   ├── page.tsx                # Server Component raíz: prefetch cacheado ('use cache') de PokéAPI + clima
│   └── globals.css             # Estilos globales, scrollbars tácticas y temas MapLibre
├── components/
│   ├── audio/
│   │   └── audio-settings-modal.tsx # Controles de música de fondo y efectos SFX
│   ├── map/
│   │   ├── pokeradar-client.tsx # Orquestador Client Component hidratado desde page.tsx
│   │   ├── map-container.tsx   # Envoltorio client-side con dynamic(..., { ssr: false })
│   │   ├── map-view.tsx        # Instancia MapLibre GL, polígonos GeoJSON, pines de bioma y sprites
│   │   └── radar-hud.tsx       # Barra Pokédex superior, biomas, búsqueda y tira de coincidencias
│   ├── pokemon/
│   │   ├── detail-drawer.tsx   # Panel lateral Pokédex con fondo dual-type, sprite normalizado y stats
│   │   ├── stats-bars.tsx      # Barras animadas de stats base (HP, Ataque, Defensa, Velocidad)
│   │   ├── cry-player.tsx      # Reproductor reactivo de audio (.ogg) con visualizador de ondas
│   │   └── type-badge.tsx      # Badges con colores e íconos oficiales de tipos en español
│   ├── expedition/
│   │   ├── party-dock.tsx      # Dock Pokédex flotante (6 ranuras) con centrado adaptativo y localStorage
│   │   └── team-analysis-modal.tsx # Modal Pokédex LCD de diagnóstico táctico grupal e individual
│   ├── ui/
│   │   ├── pokedex-sensors.tsx # Cluster reutilizable de lente óptica azul y LEDs tricolores
│   │   ├── pokedex-stepped-backdrop.tsx # Fondo SVG diagonal escalonado de tipos elementales
│   │   ├── professor-oak-dialog.tsx # Diálogo narrativo con efecto typewriter e intro/tutorial
│   │   └── welcome-screen.tsx  # Pantalla de bienvenida con carga paralela y reintento ante error
│   └── weather/
│       └── weather-badge.tsx   # Widget meteorológico en vivo (Open-Meteo) con tooltips por tipo
├── hooks/
│   ├── use-pokemon-radar.ts    # Estado de criaturas, filtros y fallback/reintento cliente
│   └── use-expedition.ts       # Manejo reactivo del equipo con useSyncExternalStore + localStorage
├── lib/
│   ├── biomes.ts               # Coordenadas, estilo raster claro y pools de especies por bioma
│   ├── pokeapi.ts              # Cliente tipado de PokéAPI y Open-Meteo + prioridad climática
│   ├── server-radar.ts         # Loader Server-Side con Next.js 16 'use cache' y cacheLife
│   ├── sound-effects.ts        # Motor de audio ambiental y SFX sintetizados con Web Audio API
│   ├── team-analysis.ts        # Matriz de efectividad (18 tipos), roles tácticos y sinergia de equipo
│   ├── type-themes.ts          # Paletas elementales compartidas y resolución de gradientes duales
│   └── utils.ts                # Clsx + Tailwind Merge y diccionarios de tipos/habilidades ES
└── types/
    └── pokemon.ts              # Modelos e interfaces TypeScript estrictas
```

---

## 3. Uso de Inteligencia Artificial (AI-Native Workflow) 🤖

El desarrollo de este proyecto se estructuró siguiendo un flujo de trabajo **AI-Native** utilizando **Google Antigravity IDE (modelos Gemini / Claude)** y **VS Code + Copilot** bajo revisión y criterio técnico propio:
- **Scaffolding y Modelado de Datos**: Formulación rápida de interfaces exhaustivas para PokéAPI v2, meteorología de Open-Meteo y capas GeoJSON.
- **Diseño de Interfaz y Microinteracciones**: Adaptación del sistema de diseño Pokédex a componentes modulares con Tailwind CSS v4 y Framer Motion.
- **Optimización Mobile y Auditoría**: Detección y corrección manual de cuellos de botella de GPU/Web Audio, reglas estrictas de React 19 ESLint y separación Server vs Client Components.

### Detección y Corrección de Alucinaciones / Errores de la IA:
1. **Acceso a `window` y Web Workers en Next.js (Turbopack)**:
   - *Error de la IA*: Importó directamente MapLibre GL en Server Components y asumió que el worker interno cargaba automáticamente sin configuración adicional.
   - *Intervención*: Se implementó un wrapper estricto con `next/dynamic({ ssr: false })` y se sirvió el worker estático `maplibre-gl-worker.mjs` en `/public/` con `setWorkerUrl()`.
2. **Dependencias no declaradas y Tipados Globales**:
   - *Error de la IA*: Utilizó el espacio de nombres `GeoJSON.FeatureCollection` asumiendo que existía globalmente en el compilador, lo que arrojaba `TS2503`.
   - *Intervención*: Se instaló `@types/geojson` mediante `pnpm` y se importaron explícitamente `FeatureCollection` y `Point` desde `geojson`.
3. **Sobrescritura de Fuentes Monoespaciadas en Tailwind v4**:
   - *Error de la IA*: Al utilizar utilidades `font-mono` en badges y textos técnicos, el navegador caía en fuentes del sistema (`Courier/Menlo`) saltándose la fuente requerida Poppins.
   - *Intervención*: Se eliminaron las clases `font-mono`, se mapearon las variables de tema a Poppins y se forzó `Poppins` globalmente en todas las etiquetas.
4. **Marcas de Agua y Latencia en Basemaps Vectoriales**:
   - *Error de la IA*: Sugirió estilos de CARTO que mostraban una marca de agua diagonal de "API KEY REQUIRED" o vector tiles con latencia en CPUs modestas.
   - *Intervención*: Se diseñó un estilo raster claro acelerado por GPU (`HIGH_PERF_LIGHT_STYLE`) sobre tiles libres de OpenStreetMap, garantizando 60 FPS estables sin costo ni marcas de agua.
5. **Formato de Coordenadas [Lng, Lat] vs [Lat, Lng]**:
   - *Error de la IA*: Confundió la convención de Leaflet `[lat, lng]` con la convención estándar de MapLibre GL / GeoJSON `[longitude, latitude]`. Se corrigieron y auditaron todas las coordenadas geográficas de los biomas argentinos.
6. **Fugas de `AudioContext`, Reglas de React 19 y No-Determinismo en `cacheComponents`**:
   - *Error de la IA*: Creó nuevas instancias de `AudioContext` en cada tick del efecto typewriter (congelando dispositivos móviles), disparó `setState` síncronos dentro de `useEffect` y usó `Math.random()` para el nivel de las criaturas.
   - *Intervención*: Se refactorizó `SoundEffectsEngine` a un singleton reutilizable, se migró a `useSyncExternalStore` y estado derivado (`0` errores en ESLint React 19), y se volvió determinista el cálculo de nivel para compatibilidad limpia con Next.js 16 `cacheComponents`.
7. **Layout CSS Flexbox, Subpíxeles en Encabezado Sticky y Táctil en Móviles**:
   - *Error de la IA*: Al añadir `overflow-hidden` en el encabezado `sticky` sin `shrink-0`, CSS Flexbox redujo su altura mínima a `0px` colapsando visualmente la barra; usó margen `-mt-4` menor al radio `rounded-t-[36px]` dejando esquinas descubiertas; y aplicó sombras/interlineados decimales (`1.5px`) con desplazamiento desigual por línea y eventos `touchend` que disparaban clics fantasma.
   - *Intervención*: Se auditó visualmente y se fijó `shrink-0 overflow-hidden` con costura opaca y hairline `1px` independiente, solapamiento `-mt-11` (`-44px`) con `h-92 pb-7` en el hero, sombras e interlineados enteros (`1px 1px 0`), y `touch-action: manipulation` para toques instantáneos sin doble disparo.

---

## 4. Próximos Pasos (Hoja de Ruta a 1 Semana) 🚀

Si contáramos con una semana adicional de desarrollo:
1. **Modelos 3D de Criaturas (glTF/three.js)**: Integrar renderizado Three.js dentro del canvas de MapLibre GL para observar los Pokémon en 3D volumétrico sobre el relieve del terreno.
2. **Simulador de Rutas de Exploración**: Trazado de rutas automáticas entre biomas con cálculo de distancia geodésica y Pokémon avistados en el trayecto.
3. **PWA Offline Completa**: Cachear los tiles del mapa y los sprites en un Service Worker para exploración en zonas sin conectividad.
4. **Modo Expedición Colaborativa**: Sincronización en tiempo real vía WebSockets para ver en el mapa a otros exploradores conectados simultáneamente.

---

## 5. Instrucciones para Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/marcoslopezsoft/pokeradar-dataint.git
cd pokeradar-dataint

# 2. Instalar dependencias con pnpm
pnpm install

# 3. Iniciar el servidor de desarrollo
pnpm dev

# 4. Abrir en el navegador
# http://localhost:3000
```
