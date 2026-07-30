import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantInvoiceComponent } from './applicant-invoice.component';

describe('ApplicantInvoiceComponent', () => {
  let component: ApplicantInvoiceComponent;
  let fixture: ComponentFixture<ApplicantInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicantInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
