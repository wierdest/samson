import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestureTrainerComponent } from './gesture-trainer.component';

describe('GestureTrainerComponent', () => {
  let component: GestureTrainerComponent;
  let fixture: ComponentFixture<GestureTrainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestureTrainerComponent]
    });
    fixture = TestBed.createComponent(GestureTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
