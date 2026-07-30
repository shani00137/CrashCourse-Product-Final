import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserscreenshotsComponent } from './userscreenshots.component';

describe('UserscreenshotsComponent', () => {
  let component: UserscreenshotsComponent;
  let fixture: ComponentFixture<UserscreenshotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserscreenshotsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserscreenshotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
