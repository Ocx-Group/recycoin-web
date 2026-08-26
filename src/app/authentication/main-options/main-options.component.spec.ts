import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainOptionsComponent } from './main-options.component';

import { testProviders } from '@app/testing/testing';

describe('MainOptionsComponent', () => {
  let component: MainOptionsComponent;
  let fixture: ComponentFixture<MainOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MainOptionsComponent ],
      providers: [...testProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
