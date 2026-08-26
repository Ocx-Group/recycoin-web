import { TestBed } from '@angular/core/testing';

import { ImageProfileService } from './image-profile.service';

import { testProviders } from '@app/testing/testing';

describe('ImageProfileService', () => {
  let service: ImageProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...testProviders] });
    service = TestBed.inject(ImageProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
