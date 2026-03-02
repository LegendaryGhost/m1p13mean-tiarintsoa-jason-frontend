import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // The interactive map is a canvas-heavy, fully dynamic page: render it on
  // the client to avoid SSR/hydration timing races and stale prerender data.
  { path: '', renderMode: RenderMode.Client },
  { path: 'plan', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
