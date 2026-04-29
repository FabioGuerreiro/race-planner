import { Routes } from '@angular/router';

import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { MyCalendarComponent } from './features/calendar/my-calendar.component';
import { RaceListComponent } from './features/races/race-list.component';

export const routes: Routes = [
  {
    path: 'calendar',
    component: MyCalendarComponent,
  },
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
