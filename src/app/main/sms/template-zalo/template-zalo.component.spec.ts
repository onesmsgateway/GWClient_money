import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateZaloComponent } from './template-zalo.component';

describe('TemplateZaloComponent', () => {
  let component: TemplateZaloComponent;
  let fixture: ComponentFixture<TemplateZaloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateZaloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateZaloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
