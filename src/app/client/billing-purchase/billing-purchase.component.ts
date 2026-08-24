import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import {ProductsComponent} from "@app/client/products/products.component";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-billing-purchase',
    templateUrl: './billing-purchase.component.html',
    styleUrls: ['./billing-purchase.component.scss'],
    standalone: true,
  imports: [TranslateModule, ProductsComponent, RouterLink],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BillingPurchaseComponent implements OnInit {
  public searchTerm!: string;
  active: number = 1;

  constructor(
  ) { }

  ngOnInit(): void {

  }

  search(event: any) {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  onTabChange(newActive: number) {
    this.active = newActive;
  }
}
