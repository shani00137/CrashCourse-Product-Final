import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsercontrollersComponent } from './usercontrollers.component';

describe('UsercontrollersComponent', () => {
  let component: UsercontrollersComponent;
  let fixture: ComponentFixture<UsercontrollersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsercontrollersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsercontrollersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
