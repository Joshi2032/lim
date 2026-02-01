import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout.component';

export const routes: Routes = [
	// Rutas de autenticación (sin sidebar)
	{
		path: '',
		component: AuthLayoutComponent,
		children: [
			{ path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
			{ path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
			{ path: '', redirectTo: 'login', pathMatch: 'full' }
		]
	},
	// Rutas privadas (con sidebar)
	{
		path: '',
		component: MainLayoutComponent,
		children: [
			{ path: 'menu', loadComponent: () => import('./menu/menu/menu.component').then(m => m.MenuComponent) },
			{ path: 'mesas', loadComponent: () => import('./menu/tables/tables.component').then(m => m.TablesComponent) },
			{ path: 'cocina', loadComponent: () => import('./menu/kitchen/kitchen.component').then(m => m.KitchenComponent) },
			{ path: 'recogida', loadComponent: () => import('./menu/pickup/pickup.component').then(m => m.PickupComponent) },
			{ path: 'recogida/nuevo', loadComponent: () => import('./menu/pickup-registration/pickup-registration.component').then(m => m.PickupRegistrationComponent) },
			{ path: 'clientes', loadComponent: () => import('./orders/customers/customers.component').then(m => m.CustomersComponent) },
			{ path: 'entregas', loadComponent: () => import('./orders/delivery/delivery.component').then(m => m.DeliveryComponent) },
			{ path: 'pedidos', loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent) },
			{ path: 'dashboard', loadComponent: () => import('./owner/dashboard/dashboard.component').then(m => m.DashboardComponent) },
			{ path: 'panel-control', loadComponent: () => import('./owner/owner.component').then(m => m.OwnerComponent) },
			{ path: 'usuarios', loadComponent: () => import('./owner/users/users.component').then(m => m.UsersComponent) },
			{ path: 'ingresos', loadComponent: () => import('./owner/income-report/income-report.component').then(m => m.IncomeReportComponent) },
		]
	},
	{ path: '**', redirectTo: 'login' }
];
