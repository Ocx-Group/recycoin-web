import { Component, OnInit } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-funding-accounts',
    templateUrl: './funding-accounts.component.html',
    styleUrls: ['./funding-accounts.component.scss'],
    standalone: true,
    imports: [TranslateModule, NgbNavModule]
})
export class FundingAccountsComponent implements OnInit {
  active;

  constructor() {
  }

  ngOnInit(): void {
  }

  onTabChange(newActive: number) {
    this.active = newActive;
  }
}
