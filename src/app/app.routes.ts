import { Routes } from '@angular/router';
import { VideoGameListComponent } from './pages/video-game-list/video-game-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'games', pathMatch: 'full' },

  // Eagerly loaded — VideoGameList is the landing page, always needed on startup
  { path: 'games', component: VideoGameListComponent },

  // Lazily loaded — VideoGameForm chunk is only downloaded when the user navigates here
  {
    path: 'games/new',
    loadComponent: () =>
      import('./pages/video-game-form/video-game-form.component').then(m => m.VideoGameFormComponent),
  },
  {
    path: 'games/:id/edit',
    loadComponent: () =>
      import('./pages/video-game-form/video-game-form.component').then(m => m.VideoGameFormComponent),
  },

  // Catch-all — redirect unknown paths back to the game list
  { path: '**', redirectTo: 'games' },
];
