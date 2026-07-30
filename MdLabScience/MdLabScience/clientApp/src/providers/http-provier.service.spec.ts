import { TestBed } from '@angular/core/testing';

import { HttpProvierService } from './http-provier.service';

describe('HttpProvierService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpProvierService = TestBed.get(HttpProvierService);
    expect(service).toBeTruthy();
  });
});
