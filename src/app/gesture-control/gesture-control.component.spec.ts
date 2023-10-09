import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestureControlComponent } from './gesture-control.component';

describe('GestureControlComponent', () => {
  let component: GestureControlComponent;
  let fixture: ComponentFixture<GestureControlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestureControlComponent]
    });
    fixture = TestBed.createComponent(GestureControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
