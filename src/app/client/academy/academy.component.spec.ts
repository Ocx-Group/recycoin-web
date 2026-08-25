import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademyComponent } from './academy.component';

import { testProviders } from '@app/testing/testing';

describe('AcademyComponent', () => {
  let component: AcademyComponent;
  let fixture: ComponentFixture<AcademyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AcademyComponent ],
      providers: [...testProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
