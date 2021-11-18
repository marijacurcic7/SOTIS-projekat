import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  homePageState: 'teacher' | 'student' | 'admin' | 'no-user' | 'still-loading'

  constructor(public route: ActivatedRoute,
    public auth: AuthService) { }

  ngOnInit(): void {
    this.homePageState = 'still-loading'
    
    this.auth.user$.subscribe(user => {
      if (user === undefined) this.homePageState = 'no-user'
      else {
        if (user.role === 'teacher') this.homePageState = 'teacher'
        else if (user.role === 'student') this.homePageState = 'student'
        else if (user.role === 'admin') this.homePageState = 'admin'
        else this.homePageState = 'no-user'
      }
    })
  }

}
