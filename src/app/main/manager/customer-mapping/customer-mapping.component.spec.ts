import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerMappingComponent } from './customer-mapping.component';

describe('CustomerMappingComponent', () => {
  let component: CustomerMappingComponent;
  let fixture: ComponentFixture<CustomerMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
