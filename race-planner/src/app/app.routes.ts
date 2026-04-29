import { Routes } from '@angular/router';

import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { RaceListComponent } from './features/races/race-list.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
  },
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
