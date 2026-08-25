import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsComponent } from './testimonials.component';

import { testProviders } from '@app/testing/testing';

describe('TestimonialsComponent', () => {
  let component: TestimonialsComponent;
  let fixture: ComponentFixture<TestimonialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TestimonialsComponent ],
      providers: [...testProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
