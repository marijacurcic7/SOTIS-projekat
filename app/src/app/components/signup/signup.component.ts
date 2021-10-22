import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  formState: 'loading' | 'sucess' | 'fail';

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.signupForm = this.signupForm = this.formBuilder.group({
      email: '',
      password: '',
      name: '',
    })
  }
  async onSubmit() {
    this.formState = 'loading';
    const { email, password, name } = this.signupForm.value
    try {
      await this.auth.signUp(email, password, name)
      this.formState = 'sucess'
      this.router.navigate(['/'])
    } catch (error) { this.formState = 'fail' }
  }

  async googleSignUp() {
    try {
      await this.auth.googleLogin()
      this.router.navigate(['/'])
    } catch (error) { this.formState = 'fail' }
  }

}
