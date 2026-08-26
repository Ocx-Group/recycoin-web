import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';
import {ProductsComponent} from "@app/client/products/products.component";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-billing-purchase',
    templateUrl: './billing-purchase.component.html',
    styleUrls: ['./billing-purchase.component.scss'],
    standalone: true,
  imports: [TranslatePipe, ProductsComponent, RouterLink],
    changeDetection: ChangeDetectionStrategy.Eager,
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
