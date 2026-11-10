# PokéRadar Geoespacial Interactivo 🌐⚡

> Aplicación web interactiva de visualización geoespacial desarrollada para el desafío técnico de **DataInt** (Ingeniería de Software · Visualización Geoespacial).

---

## 1. Concepto y Narrativa 🧭

### ¿Qué es PokéRadar?
PokéRadar transforma los datos de la **PokéAPI v2** en una expedición cartográfica inmersiva basada en biomas reales de Argentina. Inspirado en el concepto visual moderno de Pokédex (Behance), en lugar de colocar marcadores estáticos sobre un mapa genérico, el sistema fusiona:
- **Biomas Geográficos Auténticos**: Glaciar Perito Moreno (Hielo/Agua), Selva de Iguazú (Planta/Bicho/Agua), Quebrada de Humahuaca (Roca/Tierra/Fuego), Metrópolis de Buenos Aires (Eléctrico/Normal/Psíquico), Cumbre del Aconcagua (Volador/Dragón) y Península Valdés (Agua/Hada/Siniestro).
- **Meteorología en Tiempo Real (Open-Meteo)**: El clima vivo de cada región condiciona la atmósfera y contextualiza los avistamientos de las criaturas.
- **Visualización Limpia sin Cajas**: Marcadores sobre el mapa representados directamente por el sprite nativo del espécimen, con sombras de contacto en el terreno y microinteracciones de elevación (`scale-125`).
- **Audio Auténtico (`cries.latest`) & SFX Web Audio**: Reproducción de alaridos sonoros oficiales en formato `.ogg` y sintetizador de efectos auditivos para radares, capturas y liberaciones.
- **Equipo de Expedición (Party Dock)**: Dock flotante donde el investigador recluta hasta 6 Pokémon con persistencia en `localStorage`, celebración con confetti y diagnóstico táctico de cobertura elemental y estadísticas.
- **Diseño Pokédex Blanco & Tipografía Poppins**: Paleta clara, pulida y tipografía Poppins (400, 500, 600) con elementos en español.

---

## 2. Arquitectura y Stack Técnico 🛠️

### Stack Principal
- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, Turbopack, React 19).
- **Lenguaje**: TypeScript Estricto (cero `any`).
- **Gestor de Paquetes**: **pnpm** (aislamiento eficiente de dependencias y rendimiento).
- **Motor Geoespacial**: [MapLibre GL JS](https://maplibre.org/) con raster tiles optimizados de OpenStreetMap a 60 FPS, sin marcas de agua ni API keys.
- **Animaciones e Interacciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones de radar, drawer lateral, microinteracciones, halo pulsante y barras de estadísticas.
- **Estilos**: Tailwind CSS v4 para diseño Pokédex claro con efectos de cristal y acentos vibrantes.
- **Tipografía**: Google Font **Poppins** (Regular, Medium y SemiBold) configurada en Next.js Font.
- **Iconografía**: [Lucide React](https://lucide.dev/).
- **Efectos**: `canvas-confetti` al reclutar criaturas.

### Estructura del Código
```text
src/
├── app/
│   ├── layout.tsx              # Shell global con fuentes Poppins y supresión de hydration warnings
│   ├── page.tsx                # Dashboard principal integrador
│   └── globals.css             # Estilos de radar, scrollbars tácticas y temas MapLibre
├── components/
│   ├── map/
│   │   ├── map-container.tsx   # Envoltorio client-side con dynamic(..., { ssr: false })
│   │   ├── map-view.tsx        # Instancia MapLibre GL, halos de biomas y sprites directos
│   │   └── radar-hud.tsx       # Controles superiores, biomas, búsqueda y filtro de tipos en español
│   ├── pokemon/
│   │   ├── detail-drawer.tsx   # Panel lateral Behance con sprite animado, fondo dinámico y stats
│   │   ├── stats-bars.tsx      # Barras animadas de stats base (HP, Ataque, Defensa, Velocidad)
│   │   ├── cry-player.tsx      # Reproductor reactivo de audio (.ogg) con visualizador de ondas
│   │   └── type-badge.tsx      # Badges con colores oficiales de tipos en español
│   ├── expedition/
│   │   ├── party-dock.tsx      # Dock flotante con el equipo de 6 y persistencia en localStorage
│   │   └── team-analysis-modal.tsx # Diagnóstico táctico de cobertura elemental y exportación
│   └── weather/
│       └── weather-badge.tsx   # Widget en vivo conectado a Open-Meteo
├── hooks/
│   ├── use-pokemon-radar.ts    # Orquestador del estado de criaturas, biomas y filtros
│   └── use-expedition.ts       # Manejo reactivo del equipo con persistencia
├── lib/
│   ├── biomes.ts               # Coordenadas, estilo raster claro y tablas de distribución
│   ├── pokeapi.ts              # Cliente tipado de PokéAPI y Open-Meteo con cache
│   ├── sound-effects.ts        # Motor de efectos de audio sintetizados con Web Audio API
│   └── utils.ts                # Clsx + Tailwind Merge y traductor de tipos a español
└── types/
    └── pokemon.ts              # Modelos e interfaces TypeScript estrictas
```

---

## 3. Uso de Inteligencia Artificial (AI-Native Workflow) 🤖

El desarrollo de este proyecto se estructuró siguiendo un flujo de trabajo **AI-Native** asistido con herramientas de última generación:
- **Scaffolding y Modelado de Datos**: Formulación rápida de interfaces exhaustivas para PokéAPI v2, meteorología de Open-Meteo y capas GeoJSON.
- **Diseño de Interfaz y Microinteracciones**: Adaptación del sistema de diseño Pokédex (Behance) a componentes modulares con Tailwind CSS y Framer Motion.

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
