import { Routes } from '@angular/router';
import { adminGuard } from './core/auth.service';
import { Catalog } from './pages/catalog';
import { GameDetail } from './pages/game-detail';

export const routes: Routes = [
  { path: '', component: Catalog, title: 'Ignjatove igre' },
  { path: 'igra/:id', component: GameDetail, title: 'Igra · Ignjatove igre' },
  {
    path: 'igra/:id/izmena',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/game-form').then((m) => m.GameForm),
    title: 'Izmena igre · Ignjatove igre',
  },
  {
    path: 'nova',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/game-form').then((m) => m.GameForm),
    title: 'Nova igra · Ignjatove igre',
  },
  {
    path: 'tocak',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/wheel').then((m) => m.Wheel),
    title: 'Točak sreće · Ignjatove igre',
  },
  {
    path: 'prijava',
    loadComponent: () => import('./pages/login').then((m) => m.Login),
    title: 'Prijava · Ignjatove igre',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFound),
    title: 'Nije pronađeno · Ignjatove igre',
  },
];
