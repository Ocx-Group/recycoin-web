import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-matrix-create',
  templateUrl: './matrix-create.component.html',
  // Sin changeDetection explicito Angular 22 ya lo trata como OnPush; se
  // anota para que las auditorias de estrategia lo vean.
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./matrix-create.component.sass'],
  standalone: true,
  imports: []
})
export class MatrixCreateComponent {

}
