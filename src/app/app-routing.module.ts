import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component'; // Asegúrate de que esta ruta es correcta
import { MetamaskComponent } from './metamask/metamask.component'; // Importa el componente

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/inicio', 
    pathMatch: 'full' 
  }, // Redirige la ruta vacía a /inicio
  { 
    path: 'inicio', 
    component: InicioComponent 
  },
  { 
    path: 'wallet', 
    component: MetamaskComponent 
  }, // Asegúrate de que esta ruta es correcta
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
