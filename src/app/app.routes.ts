import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
	{ path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
	{ path: 'menu', loadComponent: () => import('./menu/menu/menu.component').then(m => m.MenuComponent) },
	{ path: 'mesas', loadComponent: () => import('./menu/tables/tables.component').then(m => m.TablesComponent) },
	{ path: 'cocina', loadComponent: () => import('./menu/kitchen/kitchen.component').then(m => m.KitchenComponent) },
	{ path: 'clientes', loadComponent: () => import('./menu/customers/customers.component').then(m => m.CustomersComponent) },
	{ path: 'entregas', loadComponent: () => import('./menu/delivery/delivery.component').then(m => m.DeliveryComponent) },
	{ path: 'dashboard', loadComponent: () => import('./menu/dashboard/dashboard.component').then(m => m.DashboardComponent) },
	{ path: 'panel-control', loadComponent: () => import('./owner/owner.component').then(m => m.OwnerComponent) },
	{ path: 'usuarios', loadComponent: () => import('./menu/users/users.component').then(m => m.UsersComponent) },
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: '**', redirectTo: 'login' }
];
