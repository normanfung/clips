import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import IUser from 'src/app/models/user.model';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  showAlert = false;
  alertMsg = 'Please Wait! Your account is being created!';
  alertColor = 'blue';
  inSubmission = false;

  constructor(private auth: AuthService, private emailTaken: EmailTaken) {}

  ngOnInit(): void {}

  registerForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl(
        '',
        [Validators.required, Validators.email],
        [this.emailTaken.validate.bind(this.auth)]
      ),
      age: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(18),
        Validators.max(120),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(`[a-zA-Z 1-9@$!%*#?&]{8,}`),
      ]),
      confirm_password: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    },
    [RegisterValidators.match('password', 'confirm_password')]
  );

  async register() {
    this.showAlert = true;
    this.alertMsg = 'Please Wait! Your account is being created!';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      this.auth.createUser(this.registerForm.value as IUser);
    } catch (err) {
      this.alertMsg = 'An unexpected error occured. Please try again later.';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }

    this.alertMsg = 'Success! Your account has been created!';
    this.alertColor = 'green';
  }

  get name() {
    return this.registerForm.controls.name;
  }
  get email() {
    return this.registerForm.controls.email;
  }
  get age() {
    return this.registerForm.controls.age;
  }
  get password() {
    return this.registerForm.controls.password;
  }
  get confirm_password() {
    return this.registerForm.controls.confirm_password;
  }
  get phoneNumber() {
    return this.registerForm.controls.phoneNumber;
  }
}
