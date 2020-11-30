import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenOaComponent } from './token-oa.component';

describe('TokenOaComponent', () => {
  let component: TokenOaComponent;
  let fixture: ComponentFixture<TokenOaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenOaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenOaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
