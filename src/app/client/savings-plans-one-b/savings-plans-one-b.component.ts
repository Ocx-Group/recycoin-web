import { Component } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { ProductsComponent } from '../products/products.component';
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-savings-plans-one-b',
    templateUrl: './savings-plans-one-b.component.html',
    styleUrls: ['./savings-plans-one-b.component.sass'],
    standalone: true,
  imports: [
    TranslateModule,
    ProductsComponent,
    RouterLink
]
})
export class SavingsPlansOneBComponent {
  active: number = 6;
}
