import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-third-party-payments',
    templateUrl: './third-party-payments.component.html',
    // Sin changeDetection explicito Angular 22 ya lo trata como OnPush; se
    // anota para que las auditorias de estrategia lo vean.
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./third-party-payments.component.sass'],
    standalone: true,
    imports: [CommonModule]
})
export class ThirdPartyPaymentsComponent {

}
