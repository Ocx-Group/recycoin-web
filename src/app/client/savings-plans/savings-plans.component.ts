import { Component, OnInit } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { ProductsComponent } from '../products/products.component';
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-savings-plans',
    templateUrl: './savings-plans.component.html',
    styleUrls: ['./savings-plans.component.css'],
    standalone: true,
  imports: [TranslateModule, ProductsComponent, RouterLink]
})
export class SavingsPlansComponent implements OnInit {
  active: number = 9;

  constructor() { }

  ngOnInit() {
  }
}
