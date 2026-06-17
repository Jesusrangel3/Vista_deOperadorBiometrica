# BioFleet · Centro de Control Biométrico

Dashboard de monitoreo biométrico y de salud para operadores de camiones de carga.
Stack: **React + Vite · Tailwind CSS · componentes estilo shadcn/ui · Recharts · @react-three/fiber + drei (Three.js)**.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto http://localhost:5173).

```bash
npm run build     # build de producción
npm run preview   # previsualizar el build
```

## Reemplazar el modelo 3D por tu archivo .glb

El visor usa un humanoide wireframe de prueba. Para usar tu modelo real:

1. Copia tu archivo a `public/models/operador.glb`.
2. Abre `src/components/HoloViewer.jsx`.
3. Descomenta el import de `useGLTF` y el bloque `GlbOperator`.
4. Sustituye `<PlaceholderOperator color={color} />` por `<GlbOperator color={color} />`.
5. (Opcional) deja activa la línea `useGLTF.preload("/models/operador.glb")`.

El color del modelo cambia solo según el estado del operador (verde = estable, ámbar = vigilancia, rojo = alerta).

## Estructura

```
src/
  App.jsx                 Layout y estado (operador seleccionado)
  data/drivers.js         Datos simulados (sustituir por tu API)
  lib/utils.js            cn() + rangos clínicos y lógica de alertas
  components/
    Sidebar.jsx           Buscador + lista de operadores
    HoloViewer.jsx        Visor 3D (R3F + OrbitControls)
    KpiCards.jsx          Tarjetas de signos vitales
    TrendsChart.jsx       Gráfica Recharts (6 meses)
    HealthTable.jsx       Tabla de registros (tema oscuro)
    ui/                   Primitivos estilo shadcn (card, button, table…)
```

## Conectar datos reales

Toda la lógica lee del array `drivers` en `src/data/drivers.js`. Mantén la misma forma
de objeto (campos `current`, `history`, `records`) y el dashboard se actualizará solo.
Los umbrales de alerta viven en `src/lib/utils.js` (`bpStatus`, `hrStatus`, etc.).

> Datos simulados con fines de demostración. No aptos para uso clínico real.
