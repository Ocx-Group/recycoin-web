import { TestBed } from '@angular/core/testing';

import { CoinpayService } from './coinpay.service';

import { testProviders } from '@app/testing/testing';

describe('CoinpayService', () => {
  let service: CoinpayService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...testProviders] });
    service = TestBed.inject(CoinpayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
