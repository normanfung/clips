import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipListsComponent } from './clip-lists.component';

describe('ClipListsComponent', () => {
  let component: ClipListsComponent;
  let fixture: ComponentFixture<ClipListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClipListsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClipListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
