/// <reference types="nativewind/types" />

// This NativeWind version's types don't declare an ambient module for CSS
// side-effect imports (needed for `import "./global.css"` in App.tsx) — TS 6's
// stricter side-effect-import check (TS2882) errors without this.
declare module "*.css";
