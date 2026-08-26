import { LogoService } from '@app/core/service/logo-service/logo.service';
import { Component, Input, Signal, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class LogoComponent {
  @Input() logoClass: string = '';

  /**
   * El servicio emite en cada cambio de tema y de branding. Como señal, la
   * lectura desde la plantilla marca el componente y se pinta sin depender de
   * la deteccion global; ademas la suscripcion se cierra sola.
   */
  readonly logoSrc: Signal<string>;

  constructor(private readonly logoService: LogoService) {
    this.logoSrc = toSignal(this.logoService.logoSrc$, {
      initialValue: this.logoService.getLogoSrc(),
    });
  }
}
