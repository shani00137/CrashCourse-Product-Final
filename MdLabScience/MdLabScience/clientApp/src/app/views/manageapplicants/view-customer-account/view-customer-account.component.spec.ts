import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomerAccountComponent } from './view-customer-account.component';

describe('ViewCustomerAccountComponent', () => {
  let component: ViewCustomerAccountComponent;
  let fixture: ComponentFixture<ViewCustomerAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCustomerAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCustomerAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
