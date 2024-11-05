import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core'; // Importar ChangeDetectorRef

@Component({
  selector: 'app-floating-logo',
  templateUrl: './floating-logo.component.html',
  styleUrls: ['./floating-logo.component.css']
})
export class FloatingLogoComponent implements OnInit {
  @ViewChild('metamaskLogo', { static: true }) metamaskLogo!: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('FloatingLogoComponent inicializado');
  }

  // Detecta el movimiento del mouse y coloca el logo encima del cursor
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const logo = this.metamaskLogo.nativeElement;

    // Calcula la posición del logo para que quede centrado en el cursor
    const logoSize = 32; // Tamaño del logo
    const x = event.pageX - logoSize / 2;
    const y = event.pageY - logoSize / 2;

    // Aplica las coordenadas calculadas
    logo.style.left = `${x}px`;
    logo.style.top = `${y}px`;

    // Detectar cambios para asegurar que Angular refleje los ajustes
    this.cdr.detectChanges();
  }
}
