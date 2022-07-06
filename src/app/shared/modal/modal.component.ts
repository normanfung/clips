import { Component, Input, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { elementAt } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  // providers:[ModalService] Allow Component Level Dependency Injection
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() modalID = '';

  constructor(public modal: ModalService, public el: ElementRef) {}

  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement);
  }

  closeModal() {
    this.modal.toggleModal(this.modalID);
  }

  ngOnDestroy() {
    document.body.removeChild(this.el.nativeElement);
  }
}
