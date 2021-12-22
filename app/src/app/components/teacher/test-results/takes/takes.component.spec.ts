import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakesComponent } from './takes.component';

describe('TakesComponent', () => {
  let component: TakesComponent;
  let fixture: ComponentFixture<TakesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TakesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TakesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
