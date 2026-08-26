import { TestBed } from '@angular/core/testing';

import { MembershipManagerService } from './membership-manager.service';

import { testProviders } from '@app/testing/testing';

describe('MembershipManagerService', () => {
  let service: MembershipManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...testProviders] });
    service = TestBed.inject(MembershipManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
