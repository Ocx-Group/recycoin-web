import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsPreviewComponent } from './products-preview.component';

import { testProviders } from '@app/testing/testing';

describe('ProductsPreviewComponent', () => {
  let component: ProductsPreviewComponent;
  let fixture: ComponentFixture<ProductsPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ProductsPreviewComponent ],
      providers: [...testProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
