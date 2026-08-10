import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'ventas', renderMode: RenderMode.Server },
  { path: 'ventas/:slug', renderMode: RenderMode.Server },
  { path: 'distribucion-alquiler', renderMode: RenderMode.Server },
  { path: 'distribucion-alquiler/:slug', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];
