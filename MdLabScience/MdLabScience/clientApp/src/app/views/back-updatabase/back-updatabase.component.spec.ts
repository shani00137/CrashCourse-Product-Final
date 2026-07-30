import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackUpdatabaseComponent } from './back-updatabase.component';

describe('BackUpdatabaseComponent', () => {
  let component: BackUpdatabaseComponent;
  let fixture: ComponentFixture<BackUpdatabaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackUpdatabaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BackUpdatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
