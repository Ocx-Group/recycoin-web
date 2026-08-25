import { Component, OnInit, ChangeDetectionStrategy, signal} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Product } from '@app/core/models/product-model/product.model';
import { CartService } from '@app/core/service/cart.service/cart.service';
import { ProductService } from '@app/core/service/product-service/product.service';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-academy',
    templateUrl: './academy.component.html',
    styleUrls: ['./academy.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe]
})
export class AcademyComponent implements OnInit {
  readonly products = signal<Product[]>([]);

  constructor(
    private productService: ProductService,
    private toast: ToastrService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  showSuccess(message: string) {
    this.toast.success(message);
  }

  showError(message: string) {
    this.toast.error(message);
  }

  loadProduct() {
    this.productService.getAllTradingAcademy().subscribe({
      next: (value: Product[]) => {
        value.forEach((item: any) => {
          Object.assign(item, { quantity: 1, total: item.salePrice });
        });
        this.products.set(value);
      },
      error: err => {
        this.showError('Error');
      },
    });
  }

  addtocart(item: any) {
    this.cartService.addtoCart(item);
  }
}
