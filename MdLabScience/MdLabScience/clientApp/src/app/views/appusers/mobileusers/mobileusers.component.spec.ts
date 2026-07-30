import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileusersComponent } from './mobileusers.component';

describe('MobileusersComponent', () => {
  let component: MobileusersComponent;
  let fixture: ComponentFixture<MobileusersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileusersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileusersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
