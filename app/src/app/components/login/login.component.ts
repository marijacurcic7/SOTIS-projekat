import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  formState: 'loading' | 'sucess' | 'fail';

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.loginForm = this.formBuilder.group({
      email: '',
      password: ''
    })
  }

  async onSubmit() {
    this.formState = 'loading';
    const { email, password } = this.loginForm.value
    try {
      await this.auth.loginWithEmailAndPassword(email, password)
      this.formState = 'sucess'
      this.router.navigate(['/'])
    } catch (error) { this.formState = 'fail' }
  }

  async googleLogin() {
    try {
      await this.auth.googleLogin()
      this.router.navigate(['/'])
    } catch (error) { this.formState = 'fail' }
  }
}
