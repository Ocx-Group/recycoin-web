import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProductsComponent } from '@app/client/products/products.component';

import { TranslatePipe } from '@ngx-translate/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-funding-accounts',
    templateUrl: './funding-accounts.component.html',
    styleUrls: ['./funding-accounts.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe, NgbNavModule, ProductsComponent]
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
