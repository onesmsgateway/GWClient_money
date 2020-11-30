import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendSmsComponent } from './resend-sms.component';

describe('ResendSmsComponent', () => {
  let component: ResendSmsComponent;
  let fixture: ComponentFixture<ResendSmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResendSmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResendSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
