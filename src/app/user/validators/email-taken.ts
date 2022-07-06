import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { validateCallback } from '@firebase/util';

@Injectable({
  providedIn: 'root',
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AngularFireAuth) {}

  async validate(control: AbstractControl<any, any>) {
    const response = await this.auth.fetchSignInMethodsForEmail(control.value);
    return response.length ? { emailTaken: true } : null;
  }

  //   validate(
  //     control: AbstractControl<any, any>
  //   ): Promise<ValidationErrors | null> {
  //     return this.auth
  //       .fetchSignInMethodsForEmail(control.value)
  //       .then((response) => (response.length ? { emailTaken: true } : null));
  //   }
}
