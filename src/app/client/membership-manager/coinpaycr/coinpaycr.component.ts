import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {QrcodeModule} from "qrcode-angular";

@Component({
    selector: 'app-coinpaycr',
    templateUrl: './coinpaycr.component.html',
    // Sin changeDetection explicito Angular 22 ya lo trata como OnPush; se
    // anota para que las auditorias de estrategia lo vean.
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./coinpaycr.component.sass'],
    standalone: true,
  imports: [CommonModule, QrcodeModule]
})
export class CoinpaycrComponent {

}
