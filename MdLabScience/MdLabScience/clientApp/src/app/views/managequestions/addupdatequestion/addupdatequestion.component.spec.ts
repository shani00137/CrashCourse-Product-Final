import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddupdatequestionComponent } from './addupdatequestion.component';

describe('AddupdatequestionComponent', () => {
  let component: AddupdatequestionComponent;
  let fixture: ComponentFixture<AddupdatequestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddupdatequestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddupdatequestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
