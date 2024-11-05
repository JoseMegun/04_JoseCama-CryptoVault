import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingLogoComponent } from './floating-logo.component';

describe('FloatingLogoComponent', () => {
  let component: FloatingLogoComponent;
  let fixture: ComponentFixture<FloatingLogoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FloatingLogoComponent]
    });
    fixture = TestBed.createComponent(FloatingLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
