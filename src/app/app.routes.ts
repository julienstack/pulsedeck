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
            { path: '', loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home').then(m => m.DashboardHome) },
            { path: 'members', loadComponent: () => import('./features/dashboard/members/members').then(m => m.MembersComponent) },
            { path: 'calendar', loadComponent: () => import('./features/dashboard/calendar/calendar').then(m => m.CalendarComponent) },
            { path: 'wiki', loadComponent: () => import('./features/dashboard/wiki/wiki').then(m => m.WikiComponent) },
            { path: 'ags', loadComponent: () => import('./features/dashboard/working-groups/working-groups').then(m => m.WorkingGroupsComponent) },
            { path: 'contacts', loadComponent: () => import('./features/dashboard/contacts/contacts').then(m => m.ContactsComponent) }
        ]
    }
];
