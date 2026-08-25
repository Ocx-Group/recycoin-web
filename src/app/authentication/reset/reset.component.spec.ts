import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetComponent } from './reset.component';

import { testProviders } from '@app/testing/testing';

describe('ResetComponent', () => {
  let component: ResetComponent;
  let fixture: ComponentFixture<ResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ResetComponent ],
      providers: [...testProviders]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
