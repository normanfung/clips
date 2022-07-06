import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  OnChanges,
  EventEmitter,
} from '@angular/core';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();
  inSubmission = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please Wait! Updating clip.';

  editForm = new FormGroup({
    clipID: new FormControl(''),
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  constructor(private modal: ModalService, private clipService: ClipService) {}

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return;
    }
    this.showAlert = false;
    this.inSubmission = false;
    this.clipID.setValue(this.activeClip.docID as string);
    this.title.setValue(this.activeClip.title);
  }

  get clipID() {
    return this.editForm.controls.clipID;
  }

  get title() {
    return this.editForm.controls.title;
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'true';
    this.alertMsg = 'Please Wait! Updating clip.';

    try {
      await this.clipService.updateClip(
        this.clipID.value as string,
        this.title.value as string
      );
    } catch (error) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong. Try again later';
      return;
    }
    this.activeClip.title = this.title.value as string;
    this.update.emit(this.activeClip);
    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Update Successful.';
    setTimeout(() => {
      this.modal.toggleModal('editClip');
    }, 1000);
  }
}
