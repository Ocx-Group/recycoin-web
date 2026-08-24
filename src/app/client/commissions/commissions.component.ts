import { Component, OnInit } from '@angular/core';
interface Alert {
  type: string;
  message: string;
}

const ALERTS: Alert[] = [
  {
    type: 'info',
    message:
      'Nota: Los datos reflejados en este modulo son las comisiones calculada del periodo actual, estos son las comisiones que estan por ser acreditadas.',
  },
  {
    type: 'light',
    message: 'TOTAL GENERAL: USD 0.00',
  },
];


import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-commissions',
    templateUrl: './commissions.component.html',
    standalone: true,
    imports: [TranslateModule, FormsModule]
})
export class CommissionsComponent implements OnInit {
  alerts: Alert[];
  show: Boolean = false;
  linkMsj: String = 'hide';

  constructor() {
    this.alerts = Array.from(ALERTS);
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  showMsj() {
    if (this.show) {
      this.show = false;
      this.linkMsj = 'show';
    } else {
      this.show = true;
      this.linkMsj = 'hide';
    }
  }
  ngOnInit(): void {}
}
