import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketViewAdminComponent } from './ticket-view-admin.component';

import { testProviders } from '@app/testing/testing';

describe('TicketViewAdminComponent', () => {
  let component: TicketViewAdminComponent;
  let fixture: ComponentFixture<TicketViewAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TicketViewAdminComponent ],
      providers: [...testProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketViewAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
