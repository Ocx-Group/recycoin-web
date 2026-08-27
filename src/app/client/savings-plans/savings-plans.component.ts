import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';
import { ProductsComponent } from '../products/products.component';
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-savings-plans',
    templateUrl: './savings-plans.component.html',
    styleUrls: ['./savings-plans.component.css'],
    standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, ProductsComponent, RouterLink]
})
export class SavingsPlansComponent implements OnInit {
  active: number = 9;

  constructor() { }

  ngOnInit() {
  }
}
