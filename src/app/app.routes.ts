import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
  {
    path: 'ventas/:slug',
    loadComponent: () =>
      import('./features/producto-detalle/producto-detalle').then((m) => m.ProductoDetalle),
  },
  {
    path: 'distribucion-alquiler/:slug',
    loadComponent: () =>
      import('./features/producto-detalle/producto-detalle').then((m) => m.ProductoDetalle),
  },
  {
    path: 'ventas',
    loadComponent: () => import('./features/ventas/ventas').then((m) => m.Ventas),
  },
  {
    path: 'carrito',
    loadComponent: () => import('./features/carrito/carrito').then((m) => m.Carrito),
  },
  {
    path: 'servicio-tecnico',
    loadComponent: () =>
      import('./features/servicio-tecnico/servicio-tecnico').then((m) => m.ServicioTecnico),
  },
  {
    path: 'distribucion-alquiler',
    loadComponent: () =>
      import('./features/distribucion-alquiler/distribucion-alquiler').then(
        (m) => m.DistribucionAlquiler,
      ),
  },
  {
    path: 'instalaciones',
    loadComponent: () =>
      import('./features/instalaciones/instalaciones').then((m) => m.Instalaciones),
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contacto/contacto').then((m) => m.Contacto),
  },
];
