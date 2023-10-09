import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackTrackTableComponent } from './back-track-table.component';

describe('BackTrackTableComponent', () => {
  let component: BackTrackTableComponent;
  let fixture: ComponentFixture<BackTrackTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BackTrackTableComponent]
    });
    fixture = TestBed.createComponent(BackTrackTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
