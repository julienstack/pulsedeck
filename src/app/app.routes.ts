import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/public/landing-page/landing-page').then(m => m.LandingPage)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            { path: '', loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home').then(m => m.DashboardHome) }
        ]
    }
];
