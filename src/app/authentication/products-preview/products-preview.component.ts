import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '@app/core/models/product-model/product.model';
import { ProductService } from '@app/core/service/product-service/product.service';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-products-preview',
    templateUrl: './products-preview.component.html',
    styleUrls: ['./products-preview.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TranslatePipe]
})
export class ProductsPreviewComponent implements OnInit {
  public productList: any;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadAllRecyCoin();
  }

  loadAllRecyCoin() {
    this.productService.getAllRecyCoin().subscribe((coin: Product) => {
      this.productList = coin;
      this.productList.forEach((item: any) => {
        Object.assign(item, { quantity: 1, total: item.salePrice });
      });
    })
  }
}
