import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {RouterLink} from "@angular/router";
import {ProductsComponent} from "@app/client/products/products.component";

@Component({
    selector: 'app-services-and-products',
    templateUrl: './services-and-products.component.html',
    styleUrls: ['./services-and-products.component.sass'],
    standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule, RouterLink, ProductsComponent]
})
export class ServicesAndProductsComponent implements OnInit {
  active: any;

  constructor() {

  }

  ngOnInit(): void {

  }

  onTabChange(newActive: number) {
    this.active = newActive;
  }
}
