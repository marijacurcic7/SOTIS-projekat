import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Test } from 'src/app/models/test.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-my-tests',
  templateUrl: './my-tests.component.html',
  styleUrls: ['./my-tests.component.css']
})
export class MyTestsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'topic', 'points', 'results', 'details'];
  tests: Test[] = [];
  user: User | undefined

  constructor(
    private testService: TestService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (!user) this.tests = []
      else this.testService.getTests(user.uid).subscribe(tests => this.tests = tests)
    })
  }
}
