import { Routes } from '@angular/router';

import { RaceListComponent } from './features/races/race-list.component';

export const routes: Routes = [
  {
    path: 'races',
    component: RaceListComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'races',
  },
];
