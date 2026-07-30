import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserControllerPermissionComponent } from './user-controller-permission.component';

describe('UserControllerPermissionComponent', () => {
  let component: UserControllerPermissionComponent;
  let fixture: ComponentFixture<UserControllerPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserControllerPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserControllerPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
