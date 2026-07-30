import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserrolesComponent } from './userroles.component';

describe('UserrolesComponent', () => {
  let component: UserrolesComponent;
  let fixture: ComponentFixture<UserrolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserrolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserrolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
