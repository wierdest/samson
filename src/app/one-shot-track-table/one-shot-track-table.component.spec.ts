import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneShotTrackTableComponent } from './one-shot-track-table.component';

describe('OneShotTrackTableComponent', () => {
  let component: OneShotTrackTableComponent;
  let fixture: ComponentFixture<OneShotTrackTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OneShotTrackTableComponent]
    });
    fixture = TestBed.createComponent(OneShotTrackTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
