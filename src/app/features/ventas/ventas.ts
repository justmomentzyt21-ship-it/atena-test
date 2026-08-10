import { Component } from '@angular/core';
import { CatalogoView } from '../../shared/components/catalogo-view/catalogo-view';

@Component({
  selector: 'app-ventas',
  imports: [CatalogoView],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss',
})
export class Ventas {}
