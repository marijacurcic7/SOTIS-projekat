import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Test } from 'src/app/models/test.model';
import { AuthService } from 'src/app/services/auth.service';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-all-tests',
  templateUrl: './all-tests.component.html',
  styleUrls: ['./all-tests.component.css']
})
export class AllTestsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'topic', 'points', 'teacher', 'actions'];
  tests: Test[] = [];

  constructor(
    private testService: TestService,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (!user) this.tests = []
      else this.testService.getAllTests().subscribe(tests => this.tests = tests)
    })
  }

}
