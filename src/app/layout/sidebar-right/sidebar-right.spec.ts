import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarRight } from './sidebar-right';

describe('SidebarRight', () => {
  let component: SidebarRight;
  let fixture: ComponentFixture<SidebarRight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarRight]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarRight);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
