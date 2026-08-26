import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotComponent } from './forgot.component';

import { testProviders } from '@app/testing/testing';

describe('ForgotComponent', () => {
  let component: ForgotComponent;
  let fixture: ComponentFixture<ForgotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ForgotComponent ],
      providers: [...testProviders]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
