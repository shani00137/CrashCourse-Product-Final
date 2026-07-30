import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantsservicesComponent } from './applicantsservices.component';

describe('ApplicantsservicesComponent', () => {
  let component: ApplicantsservicesComponent;
  let fixture: ComponentFixture<ApplicantsservicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicantsservicesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantsservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
