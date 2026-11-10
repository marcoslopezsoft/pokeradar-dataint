# PokéRadar Geoespacial Interactivo 🌐⚡

> Aplicación web interactiva de visualización geoespacial desarrollada para el desafío técnico de **DataInt** (Ingeniería de Software · Visualización Geoespacial).

---

## 1. Concepto y Narrativa 🧭

### ¿Qué es PokéRadar?
PokéRadar transforma los datos de la **PokéAPI v2** en una expedición cartográfica inmersiva basada en biomas reales de Argentina y del mundo. En lugar de colocar marcadores estáticos sobre un mapa genérico, el sistema fusiona:
- **Biomas Geográficos Auténticos**: Glaciar Perito Moreno (Hielo/Agua), Selva de Iguazú (Planta/Bicho/Agua), Quebrada de Humahuaca (Roca/Tierra/Fuego), Metrópolis de Buenos Aires (Eléctrico/Acero/Normal) y Cumbre del Aconcagua (Volador/Dragón).
- **Meteorología en Tiempo Real (Open-Meteo)**: El clima vivo de cada región condiciona la ambientación y la tasa de avistamiento de especies.
- **Audio Auténtico (`cries.latest`)**: Reproducción en alta fidelidad de los alaridos sonoros de cada criatura descubierta mediante Web Audio API.
- **Equipo de Expedición (Party Dock)**: Dock flotante inspirado en interfaces tácticas donde el investigador puede reclutar y guardar hasta 6 especímenes en su equipo de campo (con persistencia local en `localStorage`).

---

## 2. Arquitectura y Stack Técnico 🛠️

### Stack Principal
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19).
- **Lenguaje**: TypeScript Estricto (cero `any`).
- **Motor Geoespacial**: [MapLibre GL JS](https://maplibre.org/) con tiles vectoriales oscuros de [OpenFreeMap](https://openfreemap.org/) (Dark Style sin API Keys).
- **Animaciones e Interacciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones de radar, drawer lateral, microinteracciones y barras de estadísticas.
- **Estilos**: Tailwind CSS v4 para diseño Dark Mode táctico / radar sci-fi.
- **Iconografía**: [Lucide React](https://lucide.dev/).
- **Efectos Festivos**: `canvas-confetti` al capturar criaturas para el equipo.

### Estructura del Código
```text
src/
├── app/
│   ├── layout.tsx              # Shell global, fuentes Geist y metadata
│   ├── page.tsx                # Dashboard principal del radar
│   └── globals.css             # Estilos de radar y temas MapLibre
├── components/
│   ├── map/
│   │   ├── map-container.tsx   # Envoltorio client-side con dynamic(..., { ssr: false })
│   │   ├── map-view.tsx        # Instancia MapLibre GL, capas de biomas y marcadores pulsantes
│   │   └── radar-hud.tsx       # Controles de cámara, escáner y selector rápido de regiones
│   ├── pokemon/
│   │   ├── detail-drawer.tsx   # Panel lateral desplegable con estadísticas y datos
│   │   ├── stats-bars.tsx      # Visualizador animado de stats base (HP, Atk, Def, SpA, SpD, Spe)
│   │   ├── cry-player.tsx      # Reproductor reactivo de audio (.ogg)
│   │   └── type-badge.tsx      # Badges con gradientes oficiales por tipo
│   ├── expedition/
│   │   └── party-dock.tsx      # Dock flotante con el equipo de 6 y persistencia
│   ├── weather/
│   │   └── weather-badge.tsx   # Widget en vivo conectado a Open-Meteo
│   └── ui/
│       ├── skeletons.tsx       # Estados de carga de interfaz
│       └── search-filter.tsx   # Filtro en tiempo real por nombre y tipo
├── hooks/
│   ├── use-pokemon-radar.ts    # Orquestador del estado de criaturas y selección
│   └── use-expedition-party.ts # Manejo de capturas con localStorage
├── lib/
│   ├── biomes.ts               # Coordenadas, polígonos y tablas de spawn por bioma
│   ├── pokeapi.ts              # Cliente tipado de PokéAPI y Open-Meteo con cache
│   └── utils.ts                # Clsx + Tailwind Merge
└── types/
    └── pokemon.ts              # Modelos e interfaces TypeScript estrictas
```

---

## 3. Uso de Inteligencia Artificial (AI-Native Workflow) 🤖

El desarrollo de este proyecto se estructuró siguiendo un flujo de trabajo **AI-Native** asistido:
- **Generación de Scaffolding y Tipados**: Asistencia en la formulación de interfaces exhaustivas de la PokéAPI v2 y estructuras GeoJSON para coordenadas en MapLibre GL.
- **Microinteracciones y Shaders CSS**: Diseño de animaciones de pulso de radar (`ping-radar`), transiciones con Framer Motion y gradientes por tipo elemental.

### Detección y Corrección de Alucinaciones / Errores de la IA:
1. **Acceso al objeto `window` en SSR de Next.js App Router**: La IA tiende a importar directamente `maplibre-gl` dentro de un Server Component o en un componente sin aislamiento cliente. Se intervino implementando de forma estricta un wrapper con `next/dynamic` y `{ ssr: false }`, además de inyectar hojas de estilo de MapLibre en el cliente para evitar el error clásico `window is not defined`.
2. **Estructura del endpoint de audio `cries`**: Modelos de IA obsoletos asumían que los audios de Pokémon estaban en `sprites.cries` o archivos estáticos de GitHub desactualizados. Se validó y corrigió hacia el endpoint nativo oficial `cries.latest` (archivos `.ogg` de alta fidelidad incorporados recientemente en la API v2).
3. **Coordenadas Geoespaciales [Lng, Lat] vs [Lat, Lng]**: En librerías como Leaflet se usa `[lat, lng]`, mientras que en MapLibre GL / GeoJSON el orden estándar estricto es `[longitude, latitude]`. La IA mezcló ambos formatos; se auditaron y estandarizaron todas las coordenadas a `[lng, lat]` en `biomes.ts`.

---

## 4. Próximos Pasos (Hoja de Ruta a 1 Semana) 🚀

Si contáramos con una semana adicional de desarrollo:
1. **Generación Procedural de Capas GeoJSON de Biomas**: Representar los polígonos geográficos reales (mediante datos vectoriales de OpenStreetMap) con sombreado de elevación 3D en MapLibre GL.
2. **Modo Batalla / Exploración AR Táctica**: Permitir simular encuentros aleatorios al mover el cursor en áreas inexploradas con cálculo de probabilidad de captura según estadísticas base y tipo de Pokéball.
3. **PWA Offline con Service Worker**: Cachear tiles vectoriales y audios de las criaturas para exploración offline en dispositivos móviles sobre el terreno.
4. **Filtro Avanzado de Generaciones y Habilidades**: Selector de filtros multidimensionales con gráficos radar de estadísticas comparadas entre especies.

---

## 5. Instrucciones para Ejecución Local

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd pokeradar-dataint

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:3000
```
