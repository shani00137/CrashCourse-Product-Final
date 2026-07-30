import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerLayoutComponent } from './spinner-layout.component';

describe('SpinnerLayoutComponent', () => {
  let component: SpinnerLayoutComponent;
  let fixture: ComponentFixture<SpinnerLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpinnerLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
